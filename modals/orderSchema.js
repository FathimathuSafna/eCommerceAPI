import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "preparing", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
