import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          "http://localhost:5001/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải lịch sử mua hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <p className="text-center py-20">Đang tải đơn hàng...</p>;
  if (!orders.length)
    return (
      <p className="text-center py-20 text-gray-500">
        Bạn chưa có đơn hàng nào.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Lịch sử mua hàng
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              <div>
                <p className="font-bold text-lg text-gray-800">
                  Đơn hàng #
                  {order.orderCode || order._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-1
                    ${
                      order.orderStatus === "Đã hủy"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {order.orderStatus}
                </div>
                <div className="text-sm text-gray-500">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.paymentStatus}
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="space-y-3 mb-4">
              {order.items.slice(0, 2).map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || "/no-image.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.color} - Size {item.size} x{item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    {(item.subtotal || 0).toLocaleString()}đ
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t pt-4">
              <div>
                <span className="text-gray-600 mr-2">Tổng tiền:</span>
                <span className="font-bold text-red-600 text-xl">
                  {order.totalPrice.toLocaleString()}đ
                </span>
              </div>

              <div>
                <button
                  onClick={() => navigate(`/order-detail/${order._id}`)}
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
