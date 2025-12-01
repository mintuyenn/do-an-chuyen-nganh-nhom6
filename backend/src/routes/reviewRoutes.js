import express from "express";
import { createReview } from "../controllers/reviewController.js";
import { protect, onlyCustomer } from "../middleware/authMiddleware.js"; // nếu dùng auth

const router = express.Router();

router.post("/", protect, onlyCustomer, createReview);
export default router;
