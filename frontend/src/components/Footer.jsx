// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

const supportLinks = [
  { name: "Hướng dẫn mua hàng", href: "/user-guide-pro" },
  { name: "Chính sách đổi trả & bảo hành", href: "/warrant-policy" },
  { name: "Hệ thống cửa hàng", href: "/store-system" },
  { name: "Quy trình giao nhận", href: "/user-guide-pro" },
  { name: "Chính sách thành viên", href: "/member-policy" },
];

const policyLinks = [
  { name: "Tìm kiếm", href: "/" },
  { name: "Giới thiệu về HPTSHOP", href: "/about" },
  { name: "Sản phẩm mới", href: "/products" },
  { name: "Tuyển dụng", href: "#" },
  { name: "Liên hệ", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-gray-900 font-sans">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        {/* TOP SECTION: 4 CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* CỘT 1: THƯƠNG HIỆU & LIÊN HỆ */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              HPT<span className="text-red-600">Shop</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Thương hiệu thời trang tối giản, chú trọng vào chất liệu bền vững
              và trải nghiệm khách hàng cao cấp.
            </p>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-white mt-0.5" />
                <span>112 Hồ Văn Huê, Phú Nhuận, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-white" />
                <span className="font-bold text-white">0862 347 170</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-white" />
                <span>support@hptshop.vn</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: VỀ CHÚNG TÔI */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Về Chúng Tôi
            </h3>
            <ul className="space-y-4">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center gap-2"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Hỗ Trợ Khách Hàng
            </h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 4: KẾT NỐI & CHỨNG NHẬN */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Kết nối với chúng tôi
            </h3>

            {/* Social Icons */}
            <div className="flex gap-4 mb-8">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Chứng nhận & Thanh toán
            </h3>
            <div className="flex flex-col gap-4">
              {/* Hình ảnh thanh toán */}
              <div className="bg-white p-2 rounded w-fit">
                <img
                  src="https://res.cloudinary.com/dhbz4atrb/image/upload/v1766756998/myclothes/ynqg3zv3mq1gwmakrppp.png"
                  alt="Payment Methods"
                  className="h-8 object-contain"
                />
              </div>
              {/* Hình ảnh Bộ Công Thương */}
              <img
                src="https://res.cloudinary.com/dhbz4atrb/image/upload/v1766756999/myclothes/n5onm2oq7if24iseovkp.png"
                alt="Bo Cong Thuong"
                className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} HPTSHOP. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-400">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
