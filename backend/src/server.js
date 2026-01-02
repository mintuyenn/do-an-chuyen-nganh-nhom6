import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path"; // Import path
import passport from "passport";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import Order from "./models/orderModel.js";
import Product from "./models/productModel.js";
import Category from "./models/categogyModel.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import "./config/passport.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
// Khởi tạo passport (Thêm dòng này nếu chưa có)
app.use(passport.initialize());

// ------------------- CLOUDINARY -------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------- MULTER -------------------
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.set("trust proxy", 1); // nếu sử dụng proxy/nginx/ngrok
// --- CẤU HÌNH CORS MỚI (AN TOÀN HƠN) ---
const allowedOrigins = [
  "http://localhost:5173", // Cho phép chạy ở máy nhà
  "https://shopclothes-delta.vercel.app",
  process.env.FRONTEND_URL, // Cho phép biến môi trường (nếu có)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như Postman, Mobile App) hoặc nằm trong danh sách cho phép
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked:", origin); // Log ra để biết nếu bị chặn
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ------------------- ROUTES EXISTING -------------------
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);

// ------------------- STATIC FILES (QUAN TRỌNG) -------------------
const __dirname = path.resolve();

// Cho phép truy cập thư mục uploads (ảnh mới)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ THÊM DÒNG NÀY: Cho phép truy cập thư mục images (ảnh cũ/seed data)
// Dòng này sẽ giúp hiển thị các ảnh dạng "/images/abc.jpg"
app.use("/images", express.static(path.join(__dirname, "/images")));

// ------------------- START SERVER -------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server đã chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error("Lỗi khi khởi động server:", err);
  }
};

startServer();
