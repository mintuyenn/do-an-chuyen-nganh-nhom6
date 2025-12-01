import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader, ArrowRight } from "lucide-react";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  // ✅ Lấy ID đơn hàng từ tham số vnp_TxnRef do VNPAY trả về
  const orderId = searchParams.get("vnp_TxnRef");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Chuyển toàn bộ params từ URL thành object gửi về backend xác thực
        const params = Object.fromEntries([...searchParams]);
        
        // Gọi API Backend để check checksum và cập nhật trạng thái đơn hàng
        const { data } = await axios.get("http://localhost:5001/api/orders/vnpay-return", {
            params: params
        });

        if (data.code === "00") {
            setStatus("success");
        } else {
            setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    // Chỉ chạy khi có tham số trên URL
    if (searchParams.toString()) {
        verifyPayment();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        
        {/* TRẠNG THÁI ĐANG XỬ LÝ */}
        {status === "loading" && (
            <div className="flex flex-col items-center py-10">
                <Loader className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                <h2 className="text-xl font-bold text-gray-800">Đang xác thực giao dịch...</h2>
                <p className="text-gray-500 mt-2">Vui lòng không tắt trình duyệt</p>
            </div>
        )}

        {/* TRẠNG THÁI THÀNH CÔNG */}
        {status === "success" && (
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-600 mb-8">
                    Đơn hàng <span className="font-bold text-black">#{orderId?.slice(-6).toUpperCase()}</span> đã được xác nhận.
                </p>
                <button 
                    onClick={() => navigate(`/order-detail/${orderId}`)} 
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                    Xem chi tiết đơn hàng <ArrowRight size={18} />
                </button>
                
                <button 
                    onClick={() => navigate("/")}
                    className="mt-4 text-sm text-gray-500 hover:text-black underline"
                >
                    Về trang chủ
                </button>
            </div>
        )}

        {/* TRẠNG THÁI THẤT BẠI */}
        {status === "error" && (
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h2>
                <p className="text-gray-600 mb-8">
                    Giao dịch bị hủy hoặc có lỗi xảy ra trong quá trình xử lý.
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => navigate("/")} 
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                        Về trang chủ
                    </button>
                    <button 
                        onClick={() => navigate("/checkout")} 
                        className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;