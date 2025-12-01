import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const CartPage = () => {
  const {
    cart = { items: [] },
    updateCart,
    removeFromCart,
    totals = {},
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để tiến hành thanh toán!",
        confirmButtonColor: "#000",
        confirmButtonText: "Đăng nhập ngay",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }
    navigate("/checkout");
  };

  if (!cart.items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-6">
          Hãy dạo một vòng và chọn những món đồ ưng ý nhé!
        </p>
        <Link
          to="/products"
          className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          {cart.items.length} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const {
              price = 0,
              salePrice = 0,
              quantity = 1,
              subtotal = 0,
            } = item;
            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition gap-4"
              >
                <Link to={`/products/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image || "/no-image.png"}
                    className="w-24 h-32 object-cover rounded-xl border bg-gray-50"
                    alt={item.name}
                  />
                </Link>

                <div className="flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-lg text-gray-800 hover:text-blue-600 transition line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.color && (
                          <span className="mr-3">Màu: {item.color}</span>
                        )}
                        {item.size && <span>Size: {item.size}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart({
                          productId: item.productId,
                          color: item.color,
                          size: item.size,
                        })
                      }
                      className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                      title="Xoá sản phẩm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-between items-end mt-4 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">
                        Đơn giá
                      </span>
                      {salePrice < price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-bold text-lg">
                            {salePrice.toLocaleString()}đ
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            {price.toLocaleString()}đ
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-900 font-bold text-lg">
                          {price.toLocaleString()}đ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-gray-100 rounded-full px-1 py-1 border border-gray-200">
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 font-bold disabled:opacity-50"
                          onClick={() =>
                            updateCart({
                              productId: item.productId,
                              color: item.color,
                              size: item.size,
                              quantity: Math.max(1, quantity - 1),
                            })
                          }
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 font-semibold text-gray-800 min-w-[30px] text-center">
                          {quantity}
                        </span>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 font-bold"
                          onClick={() =>
                            updateCart({
                              productId: item.productId,
                              color: item.color,
                              size: item.size,
                              quantity: quantity + 1,
                            })
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col text-right min-w-[80px]">
                        <span className="text-xs text-gray-400 mb-1">
                          Thành tiền
                        </span>
                        <span className="text-red-600 font-bold text-lg">
                          {subtotal.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TÓM TẮT ĐƠN HÀNG */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-6 border-b pb-4">
              Tổng quan đơn hàng
            </h3>

            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              {/* Tổng tiền */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold text-gray-900">
                  Tổng tiền:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {totals.totalPrice?.toLocaleString()}đ
                </span>
              </div>

              {/* Hiển thị đã giảm giá bên dưới */}
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 mt-1">
                  <span className="text-sm">Đã giảm giá:</span>
                  <span className="text-sm font-medium">
                    - {totals.discountAmount.toLocaleString()}đ
                  </span>
                </div>
              )}

              <p className="text-xs text-gray-500 text-right mt-1">
                (Đã bao gồm VAT)
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 rounded-xl mt-8 hover:bg-gray-800 transition text-lg font-bold shadow-lg hover:shadow-gray-400/50 flex items-center justify-center gap-2"
            >
              TIẾN HÀNH THANH TOÁN
            </button>

            <div className="mt-6 text-center">
              <Link
                to="/products"
                className="text-sm text-gray-500 hover:text-black hover:underline"
              >
                ← Quay lại mua sắm thêm
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400">
              <div>
                <div className="mb-1">🔒</div>Bảo mật 100%
              </div>
              <div>
                <div className="mb-1">↩️</div>Đổi trả dễ dàng
              </div>
              <div>
                <div className="mb-1">🚀</div>Giao siêu tốc
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
