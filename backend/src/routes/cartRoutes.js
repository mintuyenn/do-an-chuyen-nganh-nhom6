import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import { protect, onlyCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

// User phải login mới dùng cart
router.get("/", protect, onlyCustomer, getCart);
router.post("/add", protect, onlyCustomer, addToCart);
router.put("/update", protect, onlyCustomer, updateCart);
router.delete("/remove", protect, onlyCustomer, removeFromCart);
router.delete("/clear", protect, onlyCustomer, clearCart);
export default router;
