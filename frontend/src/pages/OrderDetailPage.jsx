import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, MapPin, Package, CreditCard } from "lucide-react";
import Swal from "sweetalert2";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.data);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!order)
    return <div className="text-center py-20">Không tìm thấy đơn hàng</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-black mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Quay lại
      </button>

      {/* Header trạng thái */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Đơn hàng #{order.orderCode || order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-gray-500">
            Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold mb-1">
            {order.orderStatus}
          </span>
          <span className="text-sm text-gray-500">
            {order.paymentMethod === "COD"
              ? "Thanh toán khi nhận hàng"
              : order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin người nhận & Thanh toán */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <MapPin size={18} /> Địa chỉ nhận hàng
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-black">
                {order.shippingInfo?.name}
              </p>
              <p>{order.shippingInfo?.phone}</p>
              <p>{order.shippingInfo?.address}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <CreditCard size={18} /> Thanh toán
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Phương thức:{" "}
                <span className="font-medium text-black">
                  {order.paymentMethod}
                </span>
              </p>
              <p>
                Trạng thái:{" "}
                <span
                  className={`font-medium ${
                    order.paymentStatus === "Thành công"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải: Danh sách sản phẩm & Tổng tiền */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <Package size={18} /> Sản phẩm
            </h3>

            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={item.image || "/no-image.png"}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Phân loại: {item.color} / {item.size}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm">x{item.quantity}</p>
                      <p className="font-medium">
                        {(item.subtotal || 0).toLocaleString()}đ
                      </p>
                    </div>
                    {order.orderStatus === "Đã hoàn thành" && (
                      <button
                        onClick={() =>
                          navigate(`/product/${item.productId}/review`)
                        }
                        className="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 w-fit"
                      >
                        Đánh giá sản phẩm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền hàng</span>
                <span>{order.subtotalPrice?.toLocaleString()}đ</span>
              </div>
              {order.discountCart > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (Giỏ hàng)</span>
                  <span>-{order.discountCart?.toLocaleString()}đ</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (Voucher)</span>
                  <span>-{order.discountAmount?.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{(order.shippingPrice || 0).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 text-red-600 border-t mt-2">
                <span>Thành tiền</span>
                <span>{order.totalPrice.toLocaleString()}đ</span>
              </div>
              {["Chờ xác nhận", "Đã xác nhận"].includes(order.orderStatus) && (
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Bạn có chắc chắn muốn hủy đơn?",
                      text: "Sau khi hủy, đơn sẽ không thể phục hồi!",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Hủy đơn",
                      cancelButtonText: "Hủy",
                    });

                    if (result.isConfirmed) {
                      try {
                        const res = await axios.put(
                          `http://localhost:5001/api/orders/${order._id}/cancel`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        Swal.fire("Đã hủy!", res.data.message, "success");
                        // Cập nhật lại trạng thái đơn trong state
                        setOrder({ ...order, orderStatus: "Đã hủy" });
                      } catch (err) {
                        console.error(err);
                        Swal.fire(
                          "Lỗi",
                          err.response?.data?.message || "Hủy thất bại",
                          "error"
                        );
                      }
                    }
                  }}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition font-medium"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
