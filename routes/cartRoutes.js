import {
  addToCart,
  removeFromCart,
  getCartItems,
  updateCartItem
} from "../controller/cartController.js";
import express from "express";
import protect from "../middleWare/userMiddleWare.js";

const app = express.Router();
app.route("/").get(protect,getCartItems);
app.route("/:id").post(protect, addToCart)
app.route("/remove/:id").delete(removeFromCart);
app.route("/update/:id").put(protect,updateCartItem);
export default app;
