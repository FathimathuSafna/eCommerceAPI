import mongoose from "mongoose";


var Schema = mongoose.Schema;
var orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cartIds:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  }]
});





const Order = mongoose.model("Order", orderSchema);
export default Order;
