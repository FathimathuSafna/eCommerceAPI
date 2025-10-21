import Order from "../modals/orderSchema.js";
import Cart from "../modals/cartSchema.js";
import { instance } from "../app.js";
import crypto from 'crypto';


const createOrder = async (req, res) => {
  const userId = req.user._id;
  const { address, amount } = req.body;

  try {
    console.log("Request body:", req.body);

    // 1️⃣ Get all previously ordered cartIds
    const previousOrders = await Order.find({ userId }).select("cartIds");
    const usedCartIds = previousOrders.flatMap(order =>
      order.cartIds.map(id => id.toString())
    );

    console.log("Previously used cart IDs:", usedCartIds);

    // 2️⃣ Get only cart items NOT previously ordered
    const userCarts = await Cart.find({
      userId,
      _id: { $nin: usedCartIds } // exclude old cart items
    }).populate({
      path: "foodId",
      populate: {
        path: "restaurantId",
        select: "_id restaurantsName",
      },
    });

    if (userCarts.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No new cart items to order",
      });
    }

    // 3️⃣ Create a Razorpay order
    const razorpayOrder = await instance.orders.create({
      amount: Number(amount * 100),
      currency: "INR",
    });

    // 4️⃣ Group by restaurant
    const restaurantGroups = {};
    userCarts.forEach(cartItem => {
      const restaurantId = cartItem.foodId?.restaurantId?._id?.toString();
      if (!restaurantId) return;

      if (!restaurantGroups[restaurantId]) {
        restaurantGroups[restaurantId] = {
          restaurantId,
          restaurantName: cartItem.foodId.restaurantId.restaurantsName,
          cartItems: [],
          totalAmount: 0,
        };
      }

      restaurantGroups[restaurantId].cartItems.push(cartItem);
      restaurantGroups[restaurantId].totalAmount += cartItem.foodId.price * cartItem.quantity;
    });

    // 5️⃣ Create new orders for each restaurant
    const createdOrders = [];
    for (const [restaurantId, group] of Object.entries(restaurantGroups)) {
      const cartIds = group.cartItems.map(c => c._id);

      const newOrder = await Order.create({
        userId,
        cartIds,
        address,
        amount: group.totalAmount,
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "Pending",
      });

      createdOrders.push(newOrder);
    }

    // 6️⃣ Return response
    res.status(201).json({
      success: true,
      msg: `${createdOrders.length} order(s) created successfully`,
      orders: createdOrders,
      razorpayOrder,
      totalOrders: createdOrders.length,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to create order",
      error: err.message,
    });
  }
};



// Add this new controller for handling payment failures
const handlePaymentFailure = async (req, res) => {
  try {
    const { razorpay_order_id, error } = req.body;
    
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (order) {
      order.paymentStatus = "Failed";
      await order.save();
    }

    res.status(200).json({
      success: true,
      msg: "Payment failure recorded",
      paymentStatus: "Failed"
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update payment status"
    });
  }
};



const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      amount
    } = req.body;

    console.log("Verifying payment:", req.body);

    // Find the order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found"
      });
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    // Check if signature matches
    if (generated_signature === razorpay_signature) {
      // Payment SUCCESS - Update to Completed
      order.paymentStatus = "Completed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      // Clear the cart after successful payment
      // await Cart.deleteMany({ userId: order.userId });

      return res.status(200).json({
        success: true,
        msg: "Payment verified successfully",
        order,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "Completed"
      });
    } else {
      // Payment FAILED - Signature mismatch
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        msg: "Payment verification failed - Invalid signature",
        paymentStatus: "Failed"
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    
    // If error occurs, try to mark order as failed
    if (req.body.razorpay_order_id) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: req.body.razorpay_order_id },
        { paymentStatus: "Failed" }
      );
    }

    return res.status(500).json({
      success: false,
      msg: "Payment verification failed",
      error: error.message,
      paymentStatus: "Failed"
    });
  }
};


const deleteOrder = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteOrder = await Order.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Order deleted successfully",
      data: deleteOrder,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getOrders = async (req, res) => {
  const userId = req.user._id;
  try {
    const orderDetails = await Order.find({ userId })
      .populate({ path: "userId", select: "fullName email" })
      .populate({
        path: "cartIds",
        select: "quantity foodId",
        populate: {
          path: "foodId",
          select: "name price image restaurantId",
          populate: {
            path: "restaurantId",
            select: "restaurantsName",
          },
        },
      })
      .lean(); // Use lean() for better performance

    // Filter out null cartIds (deleted cart items) and log for debugging
    const cleanedOrders = orderDetails.map(order => {
      const originalCount = order.cartIds?.length || 0;
      const validCartIds = order.cartIds?.filter(item => item !== null) || [];
      
      if (originalCount !== validCartIds.length) {
        console.log(`Order ${order._id}: ${originalCount - validCartIds.length} cart items were deleted`);
      }

      return {
        ...order,
        cartIds: validCartIds
      };
    });

    res.status(200).json({
      msg: "Orders fetched successfully",
      data: cleanedOrders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(400).json({ err: err.message });
  }
};

const processPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // amount in paise
      currency: "INR",
    };

    const order = await instance.orders.create(options); // fixed syntax

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to create order",
      error: err.message,
    });
  }
};

const getKey = async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
};

const getAllOrders = async (req, res) => {
  try {
    const orderDetails = await Order.find()
      .populate({ path: "userId", select: "fullName email" })
      .populate({
        path: "cartIds",
        select: "quantity foodId",
        populate: {
          path: "foodId",
          select: "name price image restaurantId",
          populate: {
            path: "restaurantId",
            select: "restaurantsName",
          },
        },
      });

    res.status(200).json({
      msg: "All orders fetched successfully",
      data: orderDetails,
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};


const updateOrder = async (req, res) => {
  try {
    let id = req.params.id;
    const updateOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "Order updated successfully",
      data: updateOrder,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

export {
  createOrder,
  verifyPayment,
  deleteOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  processPayment,
  getKey,
  handlePaymentFailure
};
