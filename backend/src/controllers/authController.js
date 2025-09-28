import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, password, fullName, email, phone, address } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Người dùng đã tồn tại" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      phone,
      address,
    });
    await newUser.save();
    res.status(201).json({ message: "Đăng ký người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai thông tin đăng nhập" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error); // log chi tiết
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const logout = (req, res) => {
  // Since JWT is stateless, logout can be handled on the client side by deleting the token.
  res.status(200).json({ message: "Người dùng đã đăng xuất thành công" });
};

export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Không có token" });

  try {
    // Kiểm tra token cũ
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    // Tạo token mới
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Cần cung cấp cả mật khẩu hiện tại và mật khẩu mới" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác" });

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ exists: true });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
