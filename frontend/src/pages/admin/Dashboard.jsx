import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5001/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (error) {
        console.error("Lỗi tải thống kê", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan kinh doanh</h2>

      {/* Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Doanh thu" 
            value={`${stats?.stats.totalRevenue.toLocaleString()}đ`} 
            icon={<DollarSign className="text-green-600" />} 
            color="bg-green-50 border-green-200"
        />
        <StatCard 
            title="Đơn hàng" 
            value={stats?.stats.totalOrders} 
            icon={<ShoppingCart className="text-blue-600" />} 
            color="bg-blue-50 border-blue-200"
        />
        <StatCard 
            title="Sản phẩm" 
            value={stats?.stats.totalProducts} 
            icon={<Package className="text-purple-600" />} 
            color="bg-purple-50 border-purple-200"
        />
        <StatCard 
            title="Khách hàng" 
            value={stats?.stats.totalUsers} 
            icon={<Users className="text-orange-600" />} 
            color="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Biểu đồ Doanh thu */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="text-lg font-bold mb-6 text-gray-700">Biểu đồ doanh thu 7 ngày qua</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats?.chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Đơn hàng mới nhất */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-700">Đơn hàng mới nhất</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-500 text-sm border-b">
                        <th className="py-3">Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {stats?.recentOrders.map(order => (
                        <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-3 font-medium">#{order.orderCode || order._id.slice(-6).toUpperCase()}</td>
                            <td>{order.userId?.fullName || order.userId?.username || "Khách vãng lai"}</td>
                            <td className="font-bold text-gray-800">{order.totalPrice.toLocaleString()}đ</td>
                            <td>
                                <span className={`px-2 py-1 rounded text-xs font-medium 
                                    ${order.paymentStatus === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.paymentStatus}
                                </span>
                            </td>
                            <td className="text-gray-500">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// Component con hiển thị Card
const StatCard = ({ title, value, icon, color }) => (
    <div className={`p-6 rounded-2xl border ${color} flex items-center justify-between shadow-sm hover:shadow-md transition`}>
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-full shadow-sm">
            {icon}
        </div>
    </div>
);

export default Dashboard;