import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Motion from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

// Giả định các service
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/userService";
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// URL Backend API (Hãy đổi port nếu backend của bạn khác 5000)
const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim())
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!formData.password.trim())
      newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await loginService(formData);
      const profileRes = await getProfile(res.token);
      const user = profileRes.user || profileRes.data?.user;

      if (!user) throw new Error("Không lấy được thông tin người dùng");

      login({ token: res.token, user });
      setMessage("Đăng nhập thành công");

      setTimeout(() => {
        navigate(user.role === "admin" ? "/admin" : "/");
      }, 800);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Thông tin đăng nhập không chính xác",
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi bấm nút Google
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900 selection:bg-black selection:text-white">
      {/* 1. LEFT SIDE - IMAGE */}
      <Motion.motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Login"
          className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
        />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <p className="text-sm font-bold tracking-[0.3em] uppercase mb-2">
            ShopClothes Collection
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Elevate Your Style
          </h2>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </Motion.motion.div>

      {/* 2. RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <Motion.motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Chào mừng trở lại
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Đăng nhập để nhận những ưu đãi và trải nghiệm mua sắm tốt nhất!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-black transition-colors">
                Tên đăng nhập
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full border-b border-gray-300 py-3 text-slate-900 placeholder-gray-300 bg-transparent focus:outline-none focus:border-black transition-all duration-300 text-lg"
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 group-focus-within:text-black transition-colors">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-400 hover:text-black hover:underline transition-all"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border-b border-gray-300 py-3 text-slate-900 placeholder-gray-300 bg-transparent focus:outline-none focus:border-black transition-all duration-300 text-lg"
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Motion.motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white h-14 rounded-sm flex items-center justify-center gap-2 hover:bg-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group shadow-xl hover:shadow-2xl mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Đăng nhập
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Motion.motion.button>
          </form>

          {/* --- GOOGLE LOGIN SECTION --- */}
          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest">
                Hoặc
              </span>
            </div>
          </div>

          <Motion.motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#F8FAFC" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full h-14 bg-white border border-gray-300 rounded-sm flex items-center justify-center gap-3 transition-all duration-300 hover:border-gray-400 shadow-sm"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              Đăng nhập với Google
            </span>
          </Motion.motion.button>
          {/* ------------------------- */}

          {/* Error/Success Message */}
          {message && (
            <Motion.motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 text-sm font-medium text-center border ${
                message.includes("thành công")
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message}
            </Motion.motion.div>
          )}

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-black font-bold border-b border-black pb-0.5 hover:text-red-600 hover:border-red-600 transition-all ml-1"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </Motion.motion.div>
      </div>
    </div>
  );
}
