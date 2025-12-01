import path from "path";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Cấu hình Cloudinary (Lấy từ file .env bạn đã có)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Multer (Lưu tạm ảnh vào thư mục uploads/)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Kiểm tra định dạng file (Chỉ cho phép ảnh)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Chỉ chấp nhận file ảnh!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// API Upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "shop_products" 
    });
    
    // Trả về đường dẫn ảnh online
    res.send(result.secure_url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi khi upload ảnh lên Cloudinary");
  }
});

export default router;