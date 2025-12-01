import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Tag,
  ShieldCheck,
  ArrowRight,
  Loader,
  ChevronDown,
} from "lucide-react";

const CheckoutPage = () => {
  const { cart, totals } = useCart();
  const navigate = useNavigate();

  // --- FORM STATE & ERRORS ---
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  // --- PAYMENT & LOADING ---
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // --- VOUCHER STATE ---
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // --- USER COUPONS ---
  const [userCoupons, setUserCoupons] = useState([]);
  const [couponOpen, setCouponOpen] = useState(false);

  // --- Final total
  const finalTotal = Math.max(0, totals.subtotalPrice - appliedDiscount);

  // ==========================================
  // 🛡️ LOGIC VALIDATE FORM
  // ==========================================
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Vui lòng nhập họ tên người nhận";
    else if (formData.name.trim().length < 2) newErrors.name = "Tên quá ngắn";

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";

    if (!formData.address.trim())
      newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    else if (formData.address.trim().length < 10)
      newErrors.address = "Địa chỉ quá ngắn";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // ==========================================
  // 🎁 XỬ LÝ VOUCHER
  // ==========================================
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/discounts/validate",
        {
          code: voucherCode,
          subtotal: totals.subtotalPrice,
        }
      );

      if (data.success) {
        setAppliedDiscount(data.discountAmount);
        setAppliedCode(data.code);
        Swal.fire({
          icon: "success",
          title: "Áp dụng thành công!",
          text: `Bạn được giảm ${data.discountAmount.toLocaleString()}đ`,
          confirmButtonColor: "#10B981",
          timer: 2000,
        });
      }
    } catch (error) {
      setAppliedDiscount(0);
      setAppliedCode(null);
      Swal.fire({
        icon: "error",
        title: "Rất tiếc",
        text: error.response?.data?.message || "Mã không hợp lệ",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedDiscount(0);
    setAppliedCode(null);
    setVoucherCode("");
  };

  // --- Load user coupons (3 mã holiday mới nhất)
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5001/api/discounts/latest-holiday"
        );
        if (data.success) setUserCoupons(data.data);
      } catch (e) {
        console.log("Lỗi load coupon:", e);
      }
    };
    fetchCoupons();
  }, []);

  const handleUseCoupon = (code) => {
    setVoucherCode(code);
    handleApplyVoucher();
    setCouponOpen(false);
  };

  // ==========================================
  // 💳 XỬ LÝ ĐẶT HÀNG
  // ==========================================
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin chưa chuẩn",
        text: "Vui lòng kiểm tra lại các trường báo đỏ",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const orderData = {
        items: cart.items,
        subtotalPrice: totals.subtotalPrice,
        totalPrice: finalTotal,
        discountAmount: appliedDiscount,
        appliedDiscountCode: appliedCode,
        shippingPrice: 0,
        shippingAddress: formData,
        paymentMethod,
      };

      const { data } = await axios.post(
        "http://localhost:5001/api/orders",
        orderData,
        config
      );

      if (data.success) {
        if (paymentMethod === "COD") {
          Swal.fire({
            icon: "success",
            title: "Đặt hàng thành công!",
            text: "Cảm ơn bạn đã mua sắm tại cửa hàng.",
            confirmButtonColor: "#10B981",
          }).then(() => navigate(`/order-detail/${data.order._id}`));
        } else if (paymentMethod === "VNPAY" && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Lỗi",
        error.response?.data?.message || "Có lỗi xảy ra",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <p className="text-2xl font-bold mb-4">Giỏ hàng trống 😢</p>
        <button
          onClick={() => navigate("/products")}
          className="text-blue-600 hover:underline"
        >
          Mua sắm ngay
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 text-center">
          THANH TOÁN ĐƠN HÀNG
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === LEFT COLUMN === */}
          <div className="lg:col-span-7 space-y-6">
            {/* THÔNG TIN NGƯỜI NHẬN */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-blue-100 border border-white">
              <div className="flex items-center gap-3 mb-6 border-b pb-2">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin người nhận
                </h2>
              </div>
              <div className="space-y-5">
                {/* Tên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 ml-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* SĐT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Ví dụ: 0987654321"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 ml-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <textarea
                      name="address"
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 ${
                        errors.address
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 ml-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-blue-100 border border-white">
              <div className="flex items-center gap-3 mb-6 border-b pb-2">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* COD */}
                <label
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === "COD"
                      ? "border-blue-500 bg-blue-50/50 shadow-md"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="peer sr-only"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
                    <Truck size={24} />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-800">
                      Thanh toán khi nhận hàng
                    </span>
                    <span className="text-xs text-gray-500">
                      Nhận hàng kiểm tra rồi trả tiền
                    </span>
                  </div>
                  {paymentMethod === "COD" && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </label>

                {/* VNPAY */}
                <label
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === "VNPAY"
                      ? "border-blue-500 bg-blue-50/50 shadow-md"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="peer sr-only"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                  />
                  <img
                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                    alt="VNPAY"
                    className="w-10 h-10 object-contain mr-3"
                  />
                  <div>
                    <span className="block font-bold text-gray-800">
                      Ví VNPAY / Ngân hàng
                    </span>
                    <span className="text-xs text-gray-500">
                      Quét mã QR an toàn tiện lợi
                    </span>
                  </div>
                  {paymentMethod === "VNPAY" && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200 border border-white sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                Đơn hàng ({cart.items.length} món)
              </h3>

              {/* List sản phẩm */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 items-center group"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt=""
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 line-clamp-1 text-sm">
                        {item.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-gray-700">
                      {(
                        (item.salePrice || item.price) * item.quantity
                      ).toLocaleString()}
                      đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 my-4"></div>

              {/* ====== Voucher Section ====== */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Mã ưu đãi
                </label>

                {!appliedCode ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 uppercase text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                          value={voucherCode}
                          onChange={(e) =>
                            setVoucherCode(e.target.value.toUpperCase())
                          }
                        />
                      </div>
                      <button
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherCode}
                        className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:bg-gray-300 transition"
                      >
                        {voucherLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          "Áp dụng"
                        )}
                      </button>
                    </div>

                    {/* Nút xem “Ưu đãi của bạn” */}
                    <button
                      onClick={() => setCouponOpen(!couponOpen)}
                      className="mt-3 text-sm text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      Ưu đãi của bạn
                      <ChevronDown
                        size={16}
                        className={`transition ${
                          couponOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown danh sách mã */}
                    {couponOpen && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-2 max-h-40 overflow-y-auto">
                        {userCoupons.length === 0 && (
                          <p className="text-gray-400 text-xs">
                            Bạn chưa có mã ưu đãi
                          </p>
                        )}
                        {userCoupons.map((c) => (
                          <div
                            key={c._id}
                            className="flex justify-between items-center p-2 rounded hover:bg-blue-50 cursor-pointer"
                          >
                            <div className="text-sm">
                              {c.code} -{" "}
                              {c.discountType === "holiday"
                                ? `${c.discountValue}đ`
                                : `${c.discountValue}%`}
                            </div>
                            <button
                              className="text-blue-600 text-xs font-semibold hover:underline"
                              onClick={() => handleUseCoupon(c.code)}
                            >
                              Dùng mã
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <ShieldCheck size={18} />
                      <div>
                        <p className="text-sm font-bold">
                          Đã dùng mã: {appliedCode}
                        </p>
                        <p className="text-xs">
                          Tiết kiệm {appliedDiscount.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Tổng kết đơn hàng */}
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {totals.subtotalPrice.toLocaleString()}đ
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-bold">
                      -{appliedDiscount.toLocaleString()}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-blue-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-200 pt-4 mb-6">
                <span className="text-gray-800 font-bold">Tổng thanh toán</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {finalTotal.toLocaleString()}đ
                  </span>
                  <p className="text-[10px] text-gray-400">(Đã bao gồm VAT)</p>
                </div>
              </div>

              {/* Button Thanh Toán */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full group relative py-4 rounded-xl text-white font-bold text-lg overflow-hidden transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>Đang xử lý...</>
                  ) : (
                    <>
                      {paymentMethod === "VNPAY"
                        ? "THANH TOÁN NGAY"
                        : "ĐẶT HÀNG"}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </span>
              </button>

              <div className="mt-4 flex justify-center gap-4 text-gray-300">
                <ShieldCheck size={16} />{" "}
                <span className="text-xs">Bảo mật thông tin 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation cho Gradient */}
      <style>{`
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient {
            animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
