import { createOrder, deleteOrder,getOrders,getAllOrders } from "../controller/orderController.js";
import protect from "../middleWare/userMiddleWare.js";
import express from "express";

const app = express.Router();
app.route("/").post(createOrder).get(protect,getOrders);
app.route('/getAll').get(getAllOrders)
app.route("/:id").delete(deleteOrder);

//update admin order not done

export default app;
