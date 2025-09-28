import { useState } from "react";
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/userService";
import { Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [focusInput, setFocusInput] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginService(formData);
      const profile = await getProfile(res.token);
      login({ token: res.token, user: profile.data });
      setMessage("Đăng nhập thành công ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Lỗi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md transform transition duration-500 hover:scale-105 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-red-500 text-center mb-6 animate-pulse">
          Đăng nhập người dùng
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300 transition">
              <User
                className={`ml-3 h-6 w-6 text-gray-400 transition-colors duration-300 ${
                  focusInput === "username" ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <input
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusInput("username")}
                onBlur={() => setFocusInput("")}
                required
                className="flex-1 h-12 px-3 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-pink-300 focus-within:border-pink-300 transition">
              <Lock
                className={`ml-3 h-6 w-6 text-gray-400 transition-colors duration-300 ${
                  focusInput === "password" ? "text-pink-500" : "text-gray-400"
                }`}
              />
              <input
                name="password"
                type="password" // luôn ở dạng password
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusInput("password")}
                onBlur={() => setFocusInput("")}
                required
                className="flex-1 h-12 px-3 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold py-2 rounded-lg shadow-md hover:from-blue-500 hover:to-pink-500 hover:scale-105 transform transition-all duration-300 hover:shadow-lg"
          >
            Đăng nhập
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("thành công") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-700 font-semibold transition-colors"
            >
              Đăng ký
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link
              to="/forgot-password"
              className="text-pink-500 hover:text-pink-700 font-semibold transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
