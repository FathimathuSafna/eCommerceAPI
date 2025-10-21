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
  address: {
    type: String,
    required: true,
  },
   restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant' 
  },
  amount: {  // ADD THIS
    type: Number,
    required: true,
  },
  razorpayOrderId: {  // ADD THIS
    type: String,
    required: false,
  },
  razorpayPaymentId: {  // ADD THIS
    type: String,
    required: false,
  },
  razorpaySignature: {  // ADD THIS
    type: String,
    required: false,
  },
  status:{
    type:String,
    enum:["pending","preparing","delivered","cancelled"],
    default:"pending"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;