import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Shield,
  Building,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const dynamicPlaceholders = [
  "Tìm kiếm áo khoác, giày, túi xách...",
  "Tìm kiếm sản phẩm Nike, Adidas...",
  "Tìm kiếm theo màu sắc, kích cỡ...",
];

const Header = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const headerHeight = 112;
  const navigate = useNavigate();

  // Typing effect cho placeholder
  useEffect(() => {
    const currentWord = dynamicPlaceholders[wordIndex];
    let timeout;

    if (!deleting) {
      if (charIndex < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 120);
      } else {
        timeout = setTimeout(() => setDeleting(true), 1000);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50);
      } else {
        setDeleting(false);
        setWordIndex((wordIndex + 1) % dynamicPlaceholders.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex]);

  // Dropdown giữ mở thêm 300ms
  let dropdownTimeout;
  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setIsDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    dropdownTimeout = setTimeout(() => setIsDropdownOpen(false), 300);
  };

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 font-sans shadow-md bg-gray-100">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-3 px-6 border-b border-gray-300 flex-wrap">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-red-600 hover:text-red-700 transition-colors duration-300"
          >
            SHOPCLOTHES
          </Link>

          {/* Search */}
          <div className="flex-grow max-w-lg mx-4 relative hidden md:flex">
            <input
              type="text"
              placeholder={displayedText}
              className="w-full px-12 py-2 rounded-full border border-red-600 focus:outline-none bg-blue-50 placeholder-gray-500"
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/search?q=${e.target.value}`)
              }
            />
            <button
              onClick={() => {
                const value = document.querySelector(
                  'input[placeholder="' + displayedText + '"]'
                ).value;
                if (value) navigate(`/search?q=${value}`);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full hover:bg-yellow-400 transition shadow-md"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Hỗ trợ + Địa chỉ cửa hàng + Account + Cart */}
          <div className="flex items-center space-x-3 mt-2 md:mt-0">
            {/* Hỗ trợ */}
            <div className="hidden lg:flex items-center border border-red-600 bg-blue-50 rounded-lg px-3 py-1 shadow-sm hover:bg-blue-100 hover:text-red-600 transition">
              <Phone className="h-4 w-4 text-red-600 mr-1" />
              <div className="leading-tight text-sm">
                <span className="block text-gray-500 text-xs">
                  Hỗ trợ khách hàng
                </span>
                <a href="tel:0862347170" className="font-semibold text-red-600">
                  0862347170
                </a>
              </div>
            </div>

            {/* Địa chỉ cửa hàng */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=112+Hồ+Văn+Huê,+Phường+9,+Phú+Nhuận,+TP.HCM"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center border border-red-600 bg-blue-50 rounded-lg px-3 py-1 shadow-sm hover:bg-blue-100 hover:text-red-600 transition text-sm font-semibold"
            >
              <MapPin className="h-4 w-4 mr-1 text-red-600" /> 112 Hồ Văn Huê,
              Phường 9, Phú Nhuận, TP.HCM
            </a>

            {/* Tài khoản */}
            {!loading && isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex flex-col justify-center items-center text-right border border-red-600 bg-blue-50 rounded-lg px-3 py-1 shadow-sm hover:bg-blue-100 transition">
                  <span className="text-gray-500 text-xs">Xin chào</span>
                  <span className="font-semibold text-sm text-gray-800">
                    {user.username}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">
                        {user.fullName}
                      </p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-sm">{user.phone}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      Thông tin tài khoản
                    </Link>
                    <Link
                      to="/order-history"
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      Lịch sử mua hàng
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <Link
                to="/login"
                className="flex items-center border border-red-600 bg-blue-50 rounded-lg px-3 py-1 shadow-sm text-gray-600 hover:bg-blue-100 hover:text-red-600 transition"
              >
                <User className="h-4 w-4 mr-1 text-red-600" />
                <div className="leading-tight">
                  <span className="block text-xs">Tài khoản</span>
                  <span className="block font-semibold text-sm">Đăng nhập</span>
                </div>
              </Link>
            ) : (
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            )}

            {/* Giỏ hàng */}
            <Link to="/cart">
              <button className="flex items-center bg-red-600 text-white border border-yellow-400 font-semibold py-2 px-5 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition shadow-md">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span className="text-sm">Giỏ hàng</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="bg-red-700 shadow-inner">
          <nav className="flex items-center h-12 text-sm font-medium overflow-x-auto">
            <button className="flex items-center bg-red-800 text-white hover:bg-yellow-400 hover:text-gray-900 h-full px-5 font-semibold transition-colors duration-300 ml-6 rounded">
              ☰ <span className="ml-2">Danh mục sản phẩm</span>
            </button>

            <div className="flex items-center ml-6 space-x-1 flex-grow overflow-x-auto">
              {[
                {
                  icon: <Shield className="h-4 w-4 mr-1" />,
                  label: "Chính sách bảo hành",
                  path: "/chinh-sach-bao-hanh",
                },
                {
                  icon: <Building className="h-4 w-4 mr-1" />,
                  label: "Hệ thống cửa hàng",
                  path: "/he-thong-cua-hang",
                },
                {
                  icon: <BookOpen className="h-4 w-4 mr-1" />,
                  label: "Hướng dẫn sử dụng",
                  path: "/huong-dan-su-dung",
                },
                {
                  icon: <CheckCircle className="h-4 w-4 mr-1" />,
                  label: "Chính sách thành viên",
                  path: "/chinh-sach-thanh-vien",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center px-4 py-2 h-full text-white transition-colors duration-300 hover:bg-yellow-400 hover:text-gray-900 rounded whitespace-nowrap"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Padding để nội dung không bị che */}
      <div style={{ height: `${headerHeight}px` }}></div>
    </>
  );
};

export default Header;
