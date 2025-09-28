import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  Lock,
  User,
  Mail,
  Phone,
} from "lucide-react";

export default function ProfilePage() {
  const { token, user, logout, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [focusedInput, setFocusedInput] = useState(null); // để highlight icon khi focus

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
        autoHideMessage(setError);
      }
    };

    fetchProfile();
  }, [token]);

  // Tự ẩn thông báo với fade out
  const autoHideMessage = (setter, delay = 2000) => {
    setTimeout(() => setter(""), delay);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-700">⏳ Loading profile...</p>
    );
  if (!token || (!user && !profile)) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!oldPassword || !newPassword) {
      setPwdError("Vui lòng nhập đầy đủ thông tin");
      autoHideMessage(setPwdError);
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:5001/api/change-password",
        { currentPassword: oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdSuccess(res.data.message || "Đổi mật khẩu thành công");
      autoHideMessage(setPwdSuccess);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPwdError(err.response?.data?.message || "Đổi mật khẩu thất bại");
      autoHideMessage(setPwdError);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Vui lòng nhập mật khẩu để xác nhận");
      autoHideMessage(setDeleteError);
      return;
    }
    setDeleteError("");

    try {
      await axios.delete("http://localhost:5001/api/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
      });
      setSuccess("Xóa tài khoản thành công!");
      autoHideMessage(setSuccess);
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Xóa tài khoản thất bại");
      autoHideMessage(setDeleteError);
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="w-full max-w-3xl space-y-10">
        {/* Thông báo chung với fade */}
        {success && (
          <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded shadow-md space-x-2 transition-opacity duration-500 ease-out opacity-100 animate-fade-out">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center bg-red-100 text-red-800 px-4 py-2 rounded shadow-md space-x-2 transition-opacity duration-500 ease-out opacity-100 animate-fade-out">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Thông tin tài khoản */}
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Thông tin tài khoản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>
                <b>Tài khoản:</b> {profile?.username || user?.username}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-500" />
              <span>
                <b>Email:</b> {profile?.email || user?.email}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-yellow-500" />
              <span>
                <b>Số điện thoại:</b> {profile?.phone || user?.phone}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <User className="w-5 h-5 text-purple-500" />
              <span>
                <b>Địa chỉ:</b> {profile?.address || user?.address}
              </span>
            </p>
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center space-x-2">
            <Lock className="w-6 h-6 text-blue-600" />
            <span>Đổi mật khẩu</span>
          </h2>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            {pwdError && (
              <div className="flex items-center bg-red-100 text-red-800 px-3 py-2 rounded space-x-2 transition-opacity duration-500 ease-out opacity-100 animate-fade-out">
                <AlertCircle className="w-4 h-4" />
                <span>{pwdError}</span>
              </div>
            )}
            {pwdSuccess && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded space-x-2 transition-opacity duration-500 ease-out opacity-100 animate-fade-out">
                <CheckCircle className="w-4 h-4" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
              <div
                className={`flex items-center border rounded px-3 py-2 flex-1 ${
                  focusedInput === "old" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                <Lock
                  className={`w-5 h-5 mr-2 ${
                    focusedInput === "old" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu cũ"
                  className="w-full outline-none"
                  value={oldPassword}
                  onFocus={() => setFocusedInput("old")}
                  onBlur={() => setFocusedInput(null)}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div
                className={`flex items-center border rounded px-3 py-2 flex-1 ${
                  focusedInput === "new" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                <Lock
                  className={`w-5 h-5 mr-2 ${
                    focusedInput === "new" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  className="w-full outline-none"
                  onFocus={() => setFocusedInput("new")}
                  onBlur={() => setFocusedInput(null)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button className="flex bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold items-center justify-center">
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>

        {/* Xóa tài khoản */}
        <div className="bg-white shadow-md rounded p-6 text-center space-y-4">
          <div className="flex items-center justify-center bg-red-100 text-red-800 px-4 py-2 rounded shadow-md space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Khi xóa tài khoản, tất cả dữ liệu sẽ bị xóa vĩnh viễn.</span>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition font-bold shadow"
          >
            XÓA TÀI KHOẢN
          </button>
        </div>
      </div>

      {/* Modal xóa tài khoản */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4 border-2 border-red-600">
            <h3 className="flex items-center space-x-2 text-xl font-bold text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span>XÁC NHẬN XÓA TÀI KHOẢN</span>
            </h3>
            <p className="text-gray-700">Nhập mật khẩu của bạn để xác nhận</p>
            {deleteError && (
              <div className="flex items-center bg-red-100 text-red-800 px-3 py-2 rounded space-x-2 transition-opacity duration-500 ease-out opacity-100 animate-fade-out">
                <AlertCircle className="w-4 h-4" />
                <span>{deleteError}</span>
              </div>
            )}
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-bold"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
