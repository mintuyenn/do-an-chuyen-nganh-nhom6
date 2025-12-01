import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../controllers/adminController.js";

const router = express.Router();

// 1. Thống kê
router.get("/stats", protect, admin, getDashboardStats);

// 2. Users
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);

// 3. Orders
router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

// 4. Products
router.get("/products", protect, admin, getAllProductsAdmin);
router.post("/products", protect, admin, createProductAdmin);
router.put("/products/:id", protect, admin, updateProductAdmin);
router.delete("/products/:id", protect, admin, deleteProductAdmin);

// 5. Discounts (Mã giảm giá)
router.get("/discounts", protect, admin, getAllDiscounts);
router.post("/discounts", protect, admin, createDiscount);
router.put("/discounts/:id", protect, admin, updateDiscount);
router.delete("/discounts/:id", protect, admin, deleteDiscount);

export default router;
