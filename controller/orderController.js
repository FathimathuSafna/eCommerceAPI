import Order from "../modals/orderSchema.js";
import Cart from "../modals/cartSchema.js";
import { instance } from "../app.js";

const createOrder = async (req, res) => {
  const userId = req.user._id;

  try {
    const userCarts = await Cart.find({ userId });

    if (userCarts.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    const cartIds = userCarts.map((c) => c._id);

    const newOrder = await Order.create({
      userId,
      cartIds, // ✅ store only cart IDs
    });

    // Razorpay order creation
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
      receipt: `order_rcptid_${newOrder._id}`,
    };
    const razorpayOrder = await instance.orders.create(options);

    // await Cart.deleteMany({ userId });

    res.status(201).json({
      msg: "Order created successfully",
      order: newOrder,
      razorpayOrder,
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
        path: "cartIds", // ✅ populate cartIds instead of items
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
      msg: "Orders fetched successfully",
      data: orderDetails,
    });
  } catch (err) {
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
  deleteOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  processPayment,
  getKey,
};
