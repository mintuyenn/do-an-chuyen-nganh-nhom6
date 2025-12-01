import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Tổng quan",
    },
    {
      path: "/admin/products",
      icon: <ShoppingBag size={20} />,
      label: "Sản phẩm",
    },
    { path: "/admin/orders", icon: <Package size={20} />, label: "Đơn hàng" },
    { path: "/admin/users", icon: <Users size={20} />, label: "Khách hàng" },
    {
      path: "/admin/discounts",
      icon: <ShoppingBag size={20} />,
      label: "Mã giảm giá",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-center border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">
            TRANG QUẢN TRỊ ADMIN
          </h1>
        </div>
        <nav className="flex-1 py-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
