import { useState, useEffect } from "react";
import { register as registerService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/userService";
import {
  User,
  Lock,
  Mail,
  Phone,
  Home,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" hoặc "error"
  const [focusInput, setFocusInput] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Tự ẩn thông báo sau 2s
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const validateInput = () => {
    const { password, email, phone } = formData;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{6,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!passwordRegex.test(password)) {
      setMessage(
        "Mật khẩu phải tối thiểu 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      setMessageType("error");
      return false;
    }

    if (!emailRegex.test(email)) {
      setMessage("Email không đúng định dạng.");
      setMessageType("error");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      setMessage("Số điện thoại phải đúng 10 chữ số.");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateInput()) return;

    try {
      const res = await registerService(formData);

      if (res.token) {
        const profile = await getProfile(res.token);
        login({ token: res.token, user: profile.data });
      }

      setMessage(res.message || "Đăng ký thành công ✅");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Lỗi");
      setMessageType("error");
    }
  };

  const getIcon = (field) => {
    const color = focusInput === field ? "text-blue-500" : "text-gray-400";
    switch (field) {
      case "username":
      case "fullName":
        return <User className={`ml-3 h-6 w-6 ${color}`} />;
      case "password":
        return (
          <Lock
            className={`ml-3 h-6 w-6 ${
              focusInput === field ? "text-pink-500" : "text-gray-400"
            }`}
          />
        );
      case "email":
        return (
          <Mail
            className={`ml-3 h-6 w-6 ${
              focusInput === field ? "text-green-500" : "text-gray-400"
            }`}
          />
        );
      case "phone":
        return (
          <Phone
            className={`ml-3 h-6 w-6 ${
              focusInput === field ? "text-yellow-500" : "text-gray-400"
            }`}
          />
        );
      case "address":
        return (
          <Home
            className={`ml-3 h-6 w-6 ${
              focusInput === field ? "text-purple-500" : "text-gray-400"
            }`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition duration-500 hover:scale-105 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-red-500 text-center mb-6 animate-pulse">
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(formData).map((field) => (
            <div className="relative" key={field}>
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
                {getIcon(field)}
                <input
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={`Nhập ${
                    field === "fullName" ? "họ và tên" : field
                  }`}
                  value={formData[field]}
                  onChange={handleChange}
                  onFocus={() => setFocusInput(field)}
                  onBlur={() => setFocusInput("")}
                  required
                  className="flex-1 h-12 px-3 outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-blue-500 hover:to-pink-500 hover:scale-105 transform transition-all duration-300 hover:shadow-2xl text-center"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-blue-500 font-semibold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>

        {message && (
          <div
            className={`mt-4 flex items-center justify-center px-4 py-2 rounded shadow-md transition-opacity duration-500 ${
              messageType === "success"
                ? "bg-green-100 text-green-800 opacity-100"
                : "bg-red-100 text-red-800 opacity-100"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
