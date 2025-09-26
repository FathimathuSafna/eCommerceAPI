import {
  addToCart,
  removeFromCart,
  getCartItems,
} from "../controller/cartController.js";
import express from "express";
import protect from "../middleWare/userMiddleWare.js";

const app = express.Router();
app.route("/").get(protect,getCartItems);
app.route("/:id").post(protect, addToCart)
app.route("/remove/:id").delete(removeFromCart);
export default app;
