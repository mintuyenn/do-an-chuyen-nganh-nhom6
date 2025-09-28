import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api", authRoutes);

app.get("/api/tasks", (req, res) => {
  res.send("Bạn có 1 việc cần làm");
});

const startServer = async () => {
  try {
    await connectDB(); // Đảm bảo DB connect xong
    app.listen(PORT, () => {
      console.log(`✅ Server đã bắt đầu trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Lỗi khi khởi động server:", err);
  }
};

startServer();
