// cartController.js - Add this new function

import Cart from "../modals/cartSchema.js";
import Order from "../modals/orderSchema.js";

// NEW: Sync localStorage cart with database after login
const syncCart = async (req, res) => {
  const userId = req.user._id;
  const { foodIds } = req.body;

  if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0) {
    return res.status(200).json({
      msg: "No items to sync",
      data: [],
    });
  }

  try {
    // Get existing cart items from DB for this user
    const existingCartItems = await Cart.find({ userId }).lean();
    const existingFoodIds = new Set(
      existingCartItems.map((item) => item.foodId.toString())
    );

    // Filter out food items that already exist in the cart
    const newFoodIds = foodIds.filter(
      (foodId) => !existingFoodIds.has(foodId)
    );

    // Add only new items to the cart
    const cartPromises = newFoodIds.map((foodId) =>
      Cart.create({
        userId,
        foodId,
        quantity: 1,
      })
    );

    await Promise.all(cartPromises);

    // Return the complete updated cart
    const updatedCart = await Cart.find({ userId })
      .populate({
        path: "foodId",
        select: "name price image restaurantId",
        populate: {
          path: "restaurantId",
          select: "restaurantsName",
        },
      })
      .lean();

    res.status(200).json({
      msg: "Cart synced successfully",
      data: updatedCart,
      syncedCount: newFoodIds.length,
    });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(400).json({
      msg: "Failed to sync cart",
      error: err.message,
    });
  }
};

const addToCart = async (req, res) => {
  const userId = req.user._id;
  const foodId = req.params.id;
  
  if (!foodId) {
    return res.status(400).json({ msg: "foodId is required" });
  }

  try {
    // Check if item already exists in cart
    const existingItem = await Cart.findOne({ userId, foodId });
    
    if (existingItem) {
      // Update quantity if it exists
      existingItem.quantity += 1;
      await existingItem.save();
      
      return res.status(200).json({
        msg: "Item quantity updated in cart",
        data: existingItem,
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId,
      foodId,
      quantity: 1,
    });
    
    res.status(201).json({
      msg: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const removeFromCart = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteCartItem = await Cart.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Item removed from cart successfully",
      data: deleteCartItem,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getCartItems = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find all cartIds that are already linked to an Order
    const orders = await Order.find({ userId }).select("cartIds").lean();
    const orderedCartIds = new Set(
      orders.flatMap((order) => order.cartIds.map((id) => id.toString()))
    );

    // Get carts for this user that are NOT in an order
    const cartItems = await Cart.find({ userId })
      .populate({
        path: "foodId",
        select: "name price image restaurantId",
        populate: {
          path: "restaurantId",
          select: "restaurantsName",
        },
      })
      .lean();

    // Filter out cart items that belong to past orders
    const activeCartItems = cartItems.filter(
      (item) => !orderedCartIds.has(item._id.toString())
    );

    // Calculate totals
    const cartItemsWithTotal = activeCartItems.map((item) => ({
      ...item,
      totalPrice: item.quantity * (item.foodId?.price || 0),
    }));

    const cartTotalPrice = cartItemsWithTotal.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    res.status(200).json({
      msg: "Cart items fetched successfully",
      data: cartItemsWithTotal,
      cartTotalPrice,
    });
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(400).json({ msg: "Failed to fetch cart items", error: err });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    const updatedCartItem = await Cart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );
    res.status(200).json({
      msg: "Cart item updated successfully",
      data: updatedCartItem,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

export { addToCart, removeFromCart, getCartItems, updateCartItem, syncCart };