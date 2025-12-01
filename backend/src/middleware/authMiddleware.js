import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ✅ Middleware xác thực
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra user tồn tại
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const onlyCustomer = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Chỉ khách hàng mới được phép thực hiện hành động này",
    });
  }
  next();
};

//Middleware Admin (Để sửa lỗi import { admin })
export const admin = (req, res, next) => {
  // Kiểm tra xem user có phải admin không
  // (Logic này tùy thuộc vào User Model của bạn dùng field 'isAdmin' hay role='admin')
  if (req.user && (req.user.isAdmin || req.user.role === "admin")) {
    next();
  } else {
    res.status(401).json({ message: "Không được phép, yêu cầu quyền Admin" });
  }
};
