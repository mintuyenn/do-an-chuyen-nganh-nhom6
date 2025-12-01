import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { Star } from "lucide-react";

const ReviewPage = () => {
  const { productId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng chọn số sao trước khi gửi!",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5001/api/reviews`,
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Đánh giá thành công!",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Có lỗi xảy ra!",
        text: err.response?.data?.message || "Không thể gửi đánh giá",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Đánh giá sản phẩm
        </h1>

        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">
            Chọn số sao
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                className={`cursor-pointer transition-transform duration-200 ${
                  rating >= star ? "text-yellow-400 scale-110" : "text-gray-300"
                } hover:scale-125`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">
            Nhận xét của bạn
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Nhập nhận xét..."
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        <button
          onClick={submitReview}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;
