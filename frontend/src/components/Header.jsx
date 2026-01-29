// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  MapPin,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const dynamicPlaceholders = [
  "Tìm kiếm áo khoác, blazer...",
  "Tìm kiếm bộ sưu tập mùa hè...",
  "Tìm kiếm quần jeans, sơ mi...",
];

// --- DROPDOWN DANH MỤC (STYLE TỐI GIẢN) ---
const HeaderDropdown = ({ categories }) => {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const hideTimerRef = useRef(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startHideTimer = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setOpen(false);
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 200);
  };

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={() => {
        clearHideTimer();
        setOpen(true);
      }}
      onMouseLeave={startHideTimer}
    >
      <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors py-4">
        <Menu className="w-5 h-5" />
        Danh mục
      </button>

      {/* Menu Level 1 */}
      {open && categories.length > 0 && (
        <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-lg py-2 z-[60]">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="relative group"
              onMouseEnter={() => setActiveMenu(cat._id)}
            >
              <Link
                to={`/category/${cat._id}`}
                className="flex justify-between items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                {cat.name}
                {cat.children?.length > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </Link>

              {/* Menu Level 2 */}
              {cat.children?.length > 0 && activeMenu === cat._id && (
                <div className="absolute top-0 left-full w-60 bg-white shadow-xl border border-gray-100 rounded-lg py-2 ml-1">
                  {cat.children.map((sub) => (
                    <div
                      key={sub._id}
                      className="relative"
                      onMouseEnter={() => setActiveSubMenu(sub._id)}
                    >
                      <Link
                        to={`/category/${sub._id}`}
                        className="flex justify-between items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        {sub.name}
                        {sub.children?.length > 0 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </Link>

                      {/* Menu Level 3 */}
                      {sub.children?.length > 0 &&
                        activeSubMenu === sub._id && (
                          <div className="absolute top-0 left-full w-56 bg-white shadow-xl border border-gray-100 rounded-lg py-2 ml-1">
                            {sub.children.map((child) => (
                              <Link
                                key={child._id}
                                to={`/category/${child._id}`}
                                className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN HEADER ---
const Header = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  // ✅ Fix URL: Đảm bảo không bị double slash
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  const API_URL = `${BASE_URL.replace(/\/$/, "")}/api`;

  // Logic placeholder typewriter
  useEffect(() => {
    let currentIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const currentText = dynamicPlaceholders[currentIdx];

      if (!isDeleting) {
        setPlaceholder(currentText.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentText.length) {
          isDeleting = true;
          timeout = setTimeout(type, 2000);
          return;
        }
      } else {
        setPlaceholder(currentText.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % dynamicPlaceholders.length;
        }
      }
      timeout = setTimeout(type, isDeleting ? 50 : 100);
    };

    timeout = setTimeout(type, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Fetch Categories
  useEffect(() => {
    fetch(`${API_URL}/categories?tree=true`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${searchValue}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm border-b border-gray-100 font-sans text-gray-900">
        {/* 1. TOP BAR (Logo + Search + Icons) */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter uppercase shrink-0"
          >
            HPT<span className="text-red-600">Shop</span>
          </Link>

          {/* Search Bar (Giữa - Minimalist) */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-11 pl-5 pr-12 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-500 hover:text-red-600 hover:shadow-md transition-all"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Right Actions (Icons only) */}
          <div className="flex items-center gap-1 md:gap-4 shrink-0">
            {/* Store Locator (Icon only) */}
            <Link
              to="/store-system"
              className="p-2 text-gray-500 hover:text-black transition hidden lg:block"
              title="Hệ thống cửa hàng"
            >
              <MapPin size={22} />
            </Link>

            {/* Support (Icon only) */}
            <a
              href="tel:0862347170"
              className="p-2 text-gray-500 hover:text-black transition hidden lg:block"
              title="Hotline: 0862347170"
            >
              <Phone size={22} />
            </a>

            {/* Account - ĐÃ SỬA PHẦN NÀY */}
            <div className="relative group">
              {!loading && isAuthenticated ? (
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition">
                  {/* Thêm overflow-hidden để cắt ảnh tròn */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 overflow-hidden">
                    {/* Logic hiển thị: Avatar -> FullName -> Username -> Mặc định */}
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.fullName || user.username || "U")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-gray-500 hover:text-black transition"
                >
                  <User size={22} />
                </Link>
              )}

              {/* Dropdown User */}
              {!loading && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                  >
                    Thông tin tài khoản
                  </Link>
                  <Link
                    to="/order-history"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 relative text-gray-900 hover:text-red-600 transition"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* 2. NAVIGATION BAR (Menu Ngang) */}
        <div className="border-t border-gray-100 hidden md:block">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-8 h-12">
              {/* Dropdown Danh mục */}
              <HeaderDropdown categories={categories} />

              {/* Các link menu khác */}
              <nav className="flex items-center gap-6 text-sm font-medium uppercase tracking-wide text-gray-600">
                <Link
                  to="/products/new-arrivals"
                  className="hover:text-black transition-colors relative group"
                >
                  Hàng mới về
                  <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
                </Link>

                <Link
                  to="/products"
                  className="text-red-600 hover:text-red-700 transition-colors font-bold"
                >
                  Sale Up To 50%
                </Link>
                <Link
                  to="/member-policy"
                  className="hover:text-black transition-colors relative group"
                >
                  Thành viên
                  <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-black transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  to="/warrant-policy"
                  className="hover:text-black transition-colors"
                >
                  Chính sách
                </Link>
                <Link
                  to="/user-guide-pro"
                  className="hover:text-black transition-colors"
                >
                  Hướng dẫn
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Search (Hiện khi màn hình nhỏ) */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full py-2 pl-4 pr-10 bg-gray-100 rounded-lg text-sm focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search
              className="absolute right-3 top-2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </header>

      {/* Spacer để đẩy nội dung xuống dưới header fixed */}
      <div className="h-[120px] md:h-[130px]"></div>
    </>
  );
};

export default Header;
