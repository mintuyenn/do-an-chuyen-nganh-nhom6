import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  forgotPassword,
  resetPassword,
  checkEmailExists,
} from "../services/authService";
import { Mail, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [message, setMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showOtpAnim, setShowOtpAnim] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSendingOtp(true);
    setShowOtpAnim(true);
    try {
      // Gọi API kiểm tra email tồn tại
      const check = await checkEmailExists(email); // 👈 cần service mới
      if (!check.exists) {
        setMessage("Email chưa được đăng ký ❌");
        setShowOtpAnim(false);
        setSendingOtp(false);
        return;
      }

      // Nếu email tồn tại, gửi OTP
      const res = await forgotPassword(email);
      setMessage(`OTP đã gửi: ${res.otp} ✅`);
      setStep(2);
      setTimeout(() => setShowOtpAnim(false), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi khi gửi OTP");
      setShowOtpAnim(false);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await resetPassword({ email, newPassword, otp });
      setMessage(res.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const renderInput = (type, placeholder, value, setter, icon) => (
    <div className="relative">
      <div
        className={`flex items-center border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm
        ${
          focusInput === placeholder
            ? "ring-2 ring-gradient-to-r from-blue-400 to-pink-400 border-transparent"
            : "border-gray-300"
        }
        hover:shadow-md`}
      >
        <div
          className={`ml-3 transition-all duration-300 ${
            focusInput === placeholder
              ? "text-gradient-to-r from-blue-400 to-pink-400"
              : "text-gray-400"
          }`}
        >
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setter(e.target.value)}
          onFocus={() => setFocusInput(placeholder)}
          onBlur={() => setFocusInput("")}
          required
          className="flex-1 h-14 px-3 outline-none text-gray-700 placeholder-gray-400 text-lg"
        />
        {/* Animation OTP */}
        {showOtpAnim && placeholder.includes("OTP") && (
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-red-400 text-white font-bold px-2 py-1 rounded-lg animate-bounce animate-fade-slide">
            OTP
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md transform transition duration-500 hover:scale-105 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-red-500 text-center mb-6 animate-pulse">
          Quên mật khẩu
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6 relative">
            {renderInput(
              "email",
              "Nhập email của bạn",
              email,
              setEmail,
              <Mail className="h-6 w-6" />
            )}
            <button
              type="submit"
              disabled={sendingOtp}
              className={`w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-blue-500 hover:to-pink-500
              ${
                sendingOtp ? "animate-pulse opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {sendingOtp ? "Đang gửi OTP..." : "Gửi OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {renderInput(
              "text",
              "Nhập OTP",
              otp,
              setOtp,
              <Lock className="h-6 w-6" />
            )}
            {renderInput(
              "password",
              "Nhập mật khẩu mới",
              newPassword,
              setNewPassword,
              <Lock className="h-6 w-6" />
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-blue-500 hover:to-pink-500"
            >
              Đặt lại mật khẩu
            </button>
          </form>
        )}

        {message && (
          <p
            className={`mt-6 text-center font-semibold py-2 rounded-lg
              ${
                message.includes("OTP") || message.includes("thành công")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
