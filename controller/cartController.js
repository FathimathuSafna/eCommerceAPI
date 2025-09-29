import Cart from "../modals/cartSchema.js";

const addToCart = async (req, res) => {
  const userId = req.user._id;
  const  foodId = req.params.id
  if (!foodId) {
    return res.status(400).json({ msg: "foodId is required" });
  }

  try {
    const cartItem = await Cart.create({
      userId,
      foodId,
    //   quantity: quantity || 1,
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
    const cartItemsWithTotal = cartItems.map((item) => ({
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
    res.status(400).json(err);
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
  }
  catch (err) {
    res.status(400).json(err);
  }
};

export { addToCart, removeFromCart, getCartItems, updateCartItem };
