import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  await Otp.create({ email, code: otp, createdAt: new Date() });

  // Here you would typically send the OTP to the user's email.
  // For simplicity, we'll just return it in the response.
  res.status(200).json({ message: "OTP sent", otp });
};
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const record = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!record) {
    return res.status(404).json({ message: "OTP không tồn tại" });
  }
  if (record.expires < Date.now()) {
    return res.status(400).json({ message: "OTP đã hết hạn" });
  }
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword }
  );
  await Otp.deleteOne({ _id: record._id });
  res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
};
