import express from "express";
import "dotenv/config";
import connectDB from "./config/connection.js"
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import cors from "cors";


const app = express();

const corsOptions = {
 origin: [
    "http://localhost:5173",
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


app.use("/user",userRoutes)
app.use("/admin",adminRoutes)
app.use("/cart",cartRoutes)



app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

connectDB()

