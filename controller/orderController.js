import Order from "../modals/orderSchema.js";
import Cart from "../modals/cartSchema.js";

const createOrder = async (req, res) => {
  const { userId } = req.body;
  try {
    // Find all cart items for the user
    const userCarts = await Cart.find({ userId });
    const cartIds = userCarts.map(cart => cart._id);

    // Create the order with all cart item IDs
    const newOrder = await Order.create({
      userId,
      cartIds,
    });

    res.status(201).json({
      msg: "Order created successfully",
      data: newOrder,
    });
  } catch (err) {
    res.status(400).json({
      err,
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
  const userId  = req.user._id;
  let filter = {};
  if (userId) filter.userId = userId;
  try {
    const orderDetails = await Order.find(filter).populate({ path:'userId', select: 'name email' }).populate({ path: 'cartIds', populate: { path: 'foodId', select: 'name price image restaurantId', populate: { path: 'restaurantId', select: 'restaurantsName' } } });
    res.status(200).json({
      msg: "Orders fetched successfully",
      data: orderDetails,
    });
  } catch (err) {
    res.status(400).json({
      err
    });
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orderDetails = await Order.find().populate({ path:'userId', select: 'name email' }).populate({ path: 'cartIds', populate: { path: 'foodId', select: 'name price image restaurantId', populate: { path: 'restaurantId', select: 'restaurantsName' } } });
    res.status(200).json({
      msg: "All orders fetched successfully",
      data: orderDetails,
    });
  }
    catch (err) {
    res.status(400).json({
        err
    });
    }
}



export { createOrder,deleteOrder ,getOrders,getAllOrders};
