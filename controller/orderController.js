import Order from "../modals/orderSchema.js";
import Cart from "../modals/cartSchema.js";

// controllers/orderController.js

const createOrder = async (req, res) => {
  const userId = req.user._id;
  try {
    // Find all cart items for the user AND populate the food details
    const userCarts = await Cart.find({ userId }).populate('foodId');

    if (userCarts.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    // Map the cart items to the new order 'items' structure
    const orderItems = userCarts.map((cartItem) => {
      if (!cartItem.foodId) {
        throw new Error('Cart contains an invalid item.');
      }
      return {
        foodId: cartItem.foodId._id,
        quantity: cartItem.quantity,
        price: cartItem.foodId.price, // Capturing the price at the time of order
      };
    });

    const newOrder = await Order.create({
      userId,
      items: orderItems,
    });

    // It's still correct to clear the cart after the order is successfully created
    await Cart.deleteMany({ userId });

    res.status(201).json({
      msg: "Order created successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      err: err.message,
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
}

const getOrders = async (req, res) => {
  const userId = req.user._id;
  try {
    const orderDetails = await Order.find({ userId: userId })
      .populate({ path: 'userId', select: 'fullName email' })
      .populate({ 
        path: 'items.foodId', 
        select: 'name price image restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'restaurantsName'
        }
      });

    res.status(200).json({
      msg: "Orders fetched successfully",
      data: orderDetails,
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orderDetails = await Order.find()
      .populate({ path: 'userId', select: 'fullName email' })
      .populate({ 
        path: 'items.foodId', 
        select: 'name price image restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'restaurantsName'
        }
      });
console.log("order",orderDetails);

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
}



export { createOrder,deleteOrder ,getOrders,getAllOrders,updateOrder};
