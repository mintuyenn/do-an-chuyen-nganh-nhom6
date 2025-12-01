import express from "express";
import {
  getActiveDiscounts,
  validateDiscount,
  getLatestHolidayDiscounts,
} from "../controllers/discountController.js";
import { protect, admin, onlyCustomer } from "../middleware/authMiddleware.js"; // Thêm middleware bảo vệ nếu cần

const router = express.Router();

// Public routes (Ai cũng xem được)
router.get("/active", getActiveDiscounts);
router.post("/validate", validateDiscount); // ✅ Route kiểm tra mã
router.get("/latest-holiday", getLatestHolidayDiscounts);

export default router;
