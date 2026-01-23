import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";

//Initialize express app
const app = express();

//Connect to database
await connectDB();

//Middlewares
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>res.send("Server is running..."));
app.use("/api/user",userRouter)
app.use("/api/owner",ownerRouter)

// Global error handler to return cleaner upload/multipart errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ success: false, message: err.message || 'Upload error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 