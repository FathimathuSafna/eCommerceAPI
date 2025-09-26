import {
  addToCart,
  removeFromCart,
  getCartItems,
} from "../controller/cartController.js";
import express from "express";
import protect from "../middleWare/userMiddleWare.js";

const app = express.Router();

app.route("/:id").post(protect, addToCart).get(getCartItems);
app.route("/remove/:id").delete(removeFromCart);
export default app;
