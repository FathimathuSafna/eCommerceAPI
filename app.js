import express from "express";
import "dotenv/config";
import connectDB from "./config/connection.js"
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'


const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Hello world !");
});


app.use("/user",userRoutes)
app.use("/admin",adminRoutes)



app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

connectDB()

