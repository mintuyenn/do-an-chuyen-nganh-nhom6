import express from "express";
import {
  getProducts,
  getProductById,
  getLatestProducts,
  getProductsByCategoryTree,
  searchProducts,
  getRelatedProducts,
} from "../controllers/productController.js";
import { onlyCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all products (hỗ trợ lọc, phân trang, sort)
router.get("/", getProducts);

router.get("/latest", getLatestProducts);

router.get("/by-category/:id", getProductsByCategoryTree);
router.get("/search", searchProducts);

router.get("/related/:id", getRelatedProducts);

// GET product by ID
router.get("/:id", getProductById);
export default router;
