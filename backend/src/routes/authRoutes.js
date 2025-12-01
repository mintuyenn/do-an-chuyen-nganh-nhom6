import express from "express";
import { forgotPassword, resetPassword } from "../controllers/otpController.js";
import {
  register,
  login,
  checkEmailExists,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import { protect, onlyCustomer } from "../middleware/authMiddleware.js";
import { getProfile, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check-email", checkEmailExists);
router.post("/forgot-password", forgotPassword); // gửi OTP hoặc token
router.post("/reset-password", resetPassword); // reset mật khẩu mới
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

export default router;
