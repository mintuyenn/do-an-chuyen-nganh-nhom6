import express from "express";
import {
  createOrder,
  createVnPayUrl,
  vnpayReturn,
  getMyOrders,
  getOrderById,
  getProductSold,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, onlyCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, onlyCustomer, createOrder); // Tạo đơn hàng
router.get("/vnpay-return", vnpayReturn); // Callback VNPAY
router.get("/my-orders", protect, onlyCustomer, getMyOrders); // Lấy DS đơn hàng
router.get("/:id", protect, getOrderById); // Chi tiết đơn
router.post("/create-payment-url", protect, onlyCustomer, createVnPayUrl); // Tạo link thanh toán
// GET số sản phẩm đã bán
router.get("/sold/:productId", getProductSold);
router.put("/:id/cancel", protect, onlyCustomer, cancelOrder);

export default router;
