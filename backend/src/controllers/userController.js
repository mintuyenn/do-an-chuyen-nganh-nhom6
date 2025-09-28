import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
