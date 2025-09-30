import { createOrder, deleteOrder,updateOrder,getOrders,getAllOrders,processPayment,getKey } from "../controller/orderController.js";
import protect from "../middleWare/userMiddleWare.js";
import express from "express";

const app = express.Router();
app.route("/").post(protect,createOrder).get(protect,getOrders);
app.route("/payment").post(processPayment).get(getKey)
app.route('/getAll').get(getAllOrders)
app.route("/:id").delete(protect,deleteOrder).put(protect,updateOrder);

//update admin order not done

export default app;
