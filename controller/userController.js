import User from "../modals/userSchema.js";
import generateToken from "../utils/generateToken.js";

const userSignup = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const existUser = await User.findOne({ phoneNumber });
    if (existUser) {
      return res.status(400).json({
        msg: "User already exist",
      });
    }
    const userDetails = await User.create(req.body);
    res.status(201).json({
      msg: "User detailes added succesfully",

      userDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (!existUser) {
      res.status(400).json({
        msg: "user not found",
      });
    }
    if (await existUser.matchPassword(password)) {
      return res.status(200).json({
        msg: "login success",
        data: generateToken(existUser._id),
      });
    } else {
      return res.status(400).json({
        msg: "Incorrect password",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      msg: err,
    });
  }
};

const updateDetails = async (req, res) => {
  try {
    let id = req.params.id;
    const updateUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "User details updated succesfully",
      data: updateUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getUserDetails = async (req, res) => {
  let id = req.params.id;
  try {
    const getUser = await User.findById(id);
    res.status(201).jsob({
      msg: "user details fetched successfully",
      data: getUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const addToCart = async (req, res) => {
  let id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.cart.push(req.body);
    await user.save();
    res.status(200).json({ msg: "Item added to cart", data: user.cart });
  } catch (err) {
    res.status(400).json(err);
  }
};

const removeFromCart = async (req, res) => {
  let id = req.params.id;
  let itemId = req.params.itemId;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.cart = user.cart.filter((item) => item._id.toString() !== itemId);
    await user.save();
    res.status(200).json({ msg: "Item removed from cart", data: user.cart });
  } catch (err) {
    res.status(400).json(err);
  }
};

export { userSignup, userLogin, updateDetails, getUserDetails };
