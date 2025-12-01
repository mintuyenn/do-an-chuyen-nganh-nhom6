import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { onlyCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all categories (hoặc ?tree=true để lấy cây)
router.get("/", getCategories);

// GET category by ID
router.get("/:id", getCategoryById);

// POST create category
router.post("/", createCategory);

// PUT update category
router.put("/:id", updateCategory);

// DELETE category
router.delete("/:id", deleteCategory);

export default router;
