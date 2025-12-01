import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Package, Eye, Calendar, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5001/api/admin/orders", { 
            headers: { Authorization: `Bearer ${token}` } 
        }); 
        setOrders(data.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5001/api/admin/orders/${orderId}/status`, 
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Đã cập nhật trạng thái đơn hàng",
            timer: 1500,
            showConfirmButton: false
        });
        fetchOrders();
    } catch (error) {
        console.error(error);
        Swal.fire("Lỗi", "Không thể cập nhật", "error");
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải danh sách đơn hàng...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Package className="text-blue-600"/> Quản lý đơn hàng <span className="text-gray-400 text-lg">({orders.length})</span>
        </h2>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse bg-white">
                <thead className="bg-gray-50">
                    <tr className="text-gray-600 uppercase text-xs font-bold tracking-wider">
                        <th className="p-4 border-b">Mã đơn / Ngày đặt</th>
                        <th className="p-4 border-b">Thông tin khách hàng</th>
                        <th className="p-4 border-b">Tổng tiền</th>
                        <th className="p-4 border-b">Thanh toán</th>
                        <th className="p-4 border-b">Trạng thái xử lý</th>
                        <th className="p-4 border-b text-center">Chi tiết</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                    {orders.map(order => (
                        <tr key={order._id} className="hover:bg-blue-50/50 transition-colors">
                            
                            {/* Cột 1: Mã đơn & Ngày */}
                            <td className="p-4">
                                <p className="font-bold text-gray-800">#{order.orderCode || order._id.slice(-6).toUpperCase()}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Calendar size={12} />
                                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                            </td>

                            {/* Cột 2: Khách hàng (Đã sửa logic hiển thị tên) */}
                            <td className="p-4">
                                <div className="flex flex-col">
                                    {/* Tên người nhận hàng (Ưu tiên hiển thị) */}
                                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                                        <User size={14} className="text-blue-500"/>
                                        {order.shippingInfo?.name || "Không tên"}
                                    </div>
                                    
                                    {/* Tên tài khoản gốc (Hiển thị bổ sung) */}
                                    <span className="text-xs text-gray-500 ml-6">
                                        TK: {order.userId?.fullName || order.userId?.username || "Khách vãng lai"}
                                    </span>
                                    
                                    {/* Địa chỉ rút gọn */}
                                    <div className="flex items-start gap-1 text-xs text-gray-400 ml-1 mt-1 line-clamp-1 max-w-[200px]" title={order.shippingInfo?.address}>
                                        <MapPin size={12} className="shrink-0"/> 
                                        {order.shippingInfo?.address}
                                    </div>
                                </div>
                            </td>

                            {/* Cột 3: Tổng tiền */}
                            <td className="p-4 font-bold text-red-600 text-base">
                                {order.totalPrice.toLocaleString()}đ
                            </td>

                            {/* Cột 4: Trạng thái thanh toán */}
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-gray-700 text-xs uppercase border border-gray-300 rounded px-1.5 py-0.5 w-fit">
                                        {order.paymentMethod}
                                    </span>
                                    <span className={`text-xs font-bold ${order.paymentStatus === 'Thành công' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </td>

                            {/* Cột 5: Dropdown trạng thái */}
                            <td className="p-4">
                                <select 
                                    value={order.orderStatus}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`border px-3 py-1.5 rounded-lg text-sm outline-none focus:ring-2 cursor-pointer font-medium
                                        ${order.orderStatus === 'Đã hoàn thành' ? 'bg-green-50 border-green-200 text-green-700' : 
                                          order.orderStatus === 'Đã hủy' ? 'bg-red-50 border-red-200 text-red-700' : 
                                          'bg-white border-gray-300 text-gray-700 focus:ring-blue-500'}`}
                                >
                                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                                    <option value="Đã xác nhận">Đã xác nhận</option>
                                    <option value="Đang giao">Đang giao</option>
                                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                                    <option value="Đã hủy">Đã hủy</option>
                                </select>
                            </td>

                            {/* Cột 6: Hành động */}
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => navigate(`/order-detail/${order._id}`)}
                                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={20}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                                Chưa có đơn hàng nào được tạo.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default OrderManager;