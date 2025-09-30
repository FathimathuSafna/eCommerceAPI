import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  foodName: {
    type: String,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  // Store the price at the time of the order
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Replace cartIds with a self-contained items array
  items: [orderItemSchema],

  status: {
    type: String,
    enum: ["pending", "preparing", "Delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields here later
  // totalPrice: { type: Number, required: true },
  // deliveryAddress: { type: String, required: true },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
