import express from "express";
import "dotenv/config";
import connectDB from "./config/connection.js"
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import likeRoutes from './routes/likeRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cors from "cors";
import Razorpay from 'razorpay'


const app = express();

const corsOptions = {
 origin: [
    "http://localhost:5173","https://e-commerce-ui-731u.vercel.app"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Hello world !");
});

export const instance = new Razorpay({
  key_id : process.env.RAZORPAY_KEY_ID,
  key_secret : process.env.RAZORPAY_KEY_SECRET
})


app.use("/user",userRoutes)
app.use("/admin",adminRoutes)
app.use("/cart",cartRoutes)
app.use("/order",orderRoutes)
app.use("/likes",likeRoutes)
app.use('/products',productRoutes)




connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});


