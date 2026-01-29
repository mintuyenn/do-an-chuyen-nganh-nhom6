import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard"; // Đường dẫn tới component bạn cung cấp
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Clock,
} from "lucide-react";
import axios from "axios"; // Đảm bảo bạn đã cài axios
import { Link } from "react-router-dom";
const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  // Giả lập call API (Thay URL bằng endpoint thực tế của bạn)
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        // Gọi API getLatestProducts từ backend
        const res = await axios.get(`${API_URL}/products/latest`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Không thể tải sản phẩm mới. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ---------------- 1. HERO BANNER ---------------- */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden">
        {/* Background Image */}
        <img
          src="https://res.cloudinary.com/dhbz4atrb/image/upload/v1769670682/myclothes/wpds0bgapesrokk6mubv.jpg"
          alt="New Arrivals Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 animate-fade-in-up">
          <span className="text-red-500 font-bold tracking-[0.2em] text-sm md:text-base mb-2 uppercase">
            Bộ sưu tập Thu Đông 2025
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Hàng Mới Về
          </h1>
          <button
            onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
            className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            Mua Ngay <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ---------------- 2. TRUST BADGES (Service Highlights) ---------------- */}
      <div className="bg-white py-8 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <ServiceItem
            icon={<Truck />}
            title="Miễn phí vận chuyển"
            desc="Đơn hàng từ 500k"
          />
          <ServiceItem
            icon={<ShieldCheck />}
            title="Thanh toán an toàn"
            desc="Bảo mật 100%"
          />
          <ServiceItem
            icon={<RefreshCcw />}
            title="Đổi trả dễ dàng"
            desc="Trong vòng 30 ngày"
          />
          <ServiceItem
            icon={<Clock />}
            title="Hỗ trợ 24/7"
            desc="Hotline miễn phí"
          />
        </div>
      </div>

      {/* ---------------- 3. PRODUCT LIST SECTION ---------------- */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm mới nhất
            </h2>
            <p className="text-gray-500">
              Đừng bỏ lỡ những items đang được săn đón.
            </p>
          </div>
          {/* Nút xem tất cả (Optional) */}
          <Link
            to="/products"
            className="hidden md:flex items-center text-gray-900 font-semibold hover:text-red-600 transition-colors mt-4 md:mt-0"
          >
            Xem tất cả sản phẩm <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* --- Loading State (Skeleton) --- */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}

        {/* --- Error State --- */}
        {error && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-red-100">
            <p className="text-red-500 text-lg mb-2">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 underline hover:text-gray-900"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* --- Empty State --- */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">Chưa có sản phẩm mới nào.</h3>
          </div>
        )}

        {/* --- Product Grid --- */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {products.map((product) => (
              <div key={product._id} className="h-full">
                {/* Sử dụng ProductCard bạn đã cung cấp */}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS CHO GỌN CODE --- */

// Component con hiển thị tiện ích (Trust Badges)
const ServiceItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center group cursor-default">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 mb-3 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h4 className="font-bold text-sm text-gray-900">{title}</h4>
    <p className="text-xs text-gray-500 mt-1">{desc}</p>
  </div>
);

// Component Skeleton Loading (Hiệu ứng khung xương khi đang tải)
const ProductSkeleton = () => (
  <div className="flex flex-col h-full animate-pulse">
    <div className="w-full aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="flex gap-2 mb-2">
      <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
      <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-1/3 mt-auto"></div>
  </div>
);

export default NewArrivals;
