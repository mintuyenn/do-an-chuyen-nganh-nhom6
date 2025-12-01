import express from "express";
import {
  aiSearchProducts,
  aiGetCategories,
  aiCheckOrder,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/search-product", aiSearchProducts); // Input: keyword
router.get("/categories", aiGetCategories); // No Input
router.post("/check-order", aiCheckOrder); // Input: orderCode

export default router;
