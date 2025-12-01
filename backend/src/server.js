import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path"; // Import path

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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

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

// ------------------- CHATBOT MOCK (GIỮ NGUYÊN) -------------------
app.post("/api/chat", async (req, res) => {
  const { userId, question } = req.body;

  try {
    let answer = "";

    // ------------------- KIỂM TRA ĐƠN HÀNG -------------------
    const orderMatch = question.match(/#(\d+)/);
    if (orderMatch) {
      const orderCode = orderMatch[1];
      const order = await Order.findOne({ orderCode }).populate(
        "items.productId"
      );
      if (order) {
        answer = `Đơn hàng #${orderCode} hiện ở trạng thái "${order.orderStatus}" với tổng ${order.totalPrice} VND.`;
      } else {
        answer = `Không tìm thấy đơn hàng #${orderCode}. Vui lòng kiểm tra lại mã.`;
      }
      return res.json({ answer });
    }

    // ------------------- KIỂM TRA SẢN PHẨM -------------------
    const product = await Product.findOne({
      name: { $regex: question, $options: "i" },
    });
    if (product) {
      let totalStock = 0;
      // Kiểm tra nếu variants tồn tại thì mới lặp, tránh lỗi
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v) =>
          v.sizes.forEach((sz) => (totalStock += sz.stock))
        );
      } else {
        totalStock = product.countInStock || 0; // Fallback nếu không có variants
      }

      answer =
        totalStock > 0
          ? `Sản phẩm ${product.name} còn ${totalStock} chiếc với giá ${product.price} VND.`
          : `Sản phẩm ${product.name} hiện đã hết hàng.`;
      return res.json({ answer });
    }

    // ------------------- KIỂM TRA DANH MỤC -------------------
    const category = await Category.findOne({
      name: { $regex: question, $options: "i" },
    });
    if (category) {
      answer = `Danh mục "${category.name}" tồn tại. Bạn muốn xem sản phẩm trong danh mục này không?`;
      return res.json({ answer });
    }

    // ------------------- FALLBACK -------------------
    answer =
      "Xin lỗi, mình chưa hiểu câu hỏi. Vui lòng hỏi về mã đơn hàng, sản phẩm hoặc danh mục.";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.json({ answer: "Có lỗi xảy ra, vui lòng thử lại sau." });
  }
});

// ------------------- START SERVER -------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server đã chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error("Lỗi khi khởi động server:", err);
  }
};

startServer();
