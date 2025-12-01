import React, { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, activeVariant = null }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(
    activeVariant || product.variants?.[0] || null
  );

  const [selectedImage, setSelectedImage] = useState(
    activeVariant?.images?.[0] ||
      product.variants?.[0]?.images?.[0] ||
      product.images?.[0] ||
      "/placeholder.png"
  );

  const [toast, setToast] = useState(null); // ✅ Toast state

  useEffect(() => {
    if (activeVariant) {
      setSelectedVariant(activeVariant);
      setSelectedImage(
        activeVariant.images?.[0] || product.images?.[0] || "/placeholder.png"
      );
    }
  }, [activeVariant, product]);

  const getVariantImage = (variant) => {
    if (variant?.images?.length > 0) return variant.images[0];
    if (product.images?.length > 0) return product.images[0];
    return "/placeholder.png";
  };

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

  const discountedPrice = product.finalPrice ?? product.price;
  const discountInfo = product.discountInfo;

  return (
    <>
      {/* ✅ Toast Shopee style */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white z-50
          animate-slide`}
          style={{
            backgroundColor: toast.type === "success" ? "#1abc9c" : "#e74c3c",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      <div className="relative bg-white rounded-2xl shadow hover:shadow-xl transition duration-300 p-4 flex flex-col group overflow-visible">
        {discountInfo && (
          <div className="absolute -top-3 -left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-20">
            🔥{" "}
            {discountInfo.type === "percent"
              ? `-${discountInfo.value}%`
              : discountInfo.type === "fixed"
              ? `-${discountInfo.value.toLocaleString("vi-VN")}đ`
              : discountInfo.name}
          </div>
        )}
        <div
          className="relative overflow-hidden rounded-xl cursor-pointer"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {selectedVariant?.images?.length > 1 && (
          <div className="flex gap-2 mt-2">
            {selectedVariant.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition ${
                  selectedImage === img
                    ? "border-red-500 scale-105"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                <img
                  src={img}
                  alt={idx}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mt-3 mb-1">
          {product.name}{" "}
          {selectedVariant?.color && `- ${selectedVariant.color}`}
        </h3>
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const rating = product.averageRating;
              const diff = rating - i;

              let starClass = "text-gray-300"; // sao trống
              if (diff >= 1) starClass = "text-yellow-400"; // sao đầy
              else if (diff > 0) starClass = "text-yellow-400/50"; // sao nửa

              return <Star key={i} size={16} className={starClass} />;
            })}
            <span className="text-gray-500 text-xs ml-1">
              {product.averageRating.toFixed(1)}/5
            </span>
          </div>
        )}

        {discountedPrice < product.price ? (
          <div className="mb-2">
            <p className="text-red-600 font-bold text-base">
              {discountedPrice.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-gray-400 text-sm line-through">
              {product.price.toLocaleString("vi-VN")}đ
            </p>
          </div>
        ) : (
          <p className="text-red-600 font-bold text-base mb-2">
            {product.price.toLocaleString("vi-VN")}đ
          </p>
        )}

        {product.variants?.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.variants.map((variant) => (
              <button
                key={variant._id}
                onClick={() => {
                  setSelectedVariant(variant);
                  setSelectedImage(getVariantImage(variant));
                }}
                className={`w-8 h-8 rounded-full border-2 overflow-hidden transition
                  ${
                    selectedVariant?._id === variant._id
                      ? "border-red-500 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                title={variant.color}
              >
                <img
                  src={getVariantImage(variant)}
                  alt={variant.color}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            const token = localStorage.getItem("token");

            if (!token) {
              showToast("Vui lòng đăng nhập để mua hàng!", "error");
              setTimeout(() => navigate("/login?redirect=cart"), 1500);
              return;
            }

            // ✅ Lấy variant (nếu sản phẩm có màu)
            const variant =
              product.variants?.length > 0 ? selectedVariant : null;

            // Nếu có variants nhưng user chưa chọn -> yêu cầu chọn màu
            if (product.variants?.length > 0 && !variant) {
              showToast("Vui lòng chọn màu!", "error");
              return;
            }

            // ✅ Lấy size (nếu variant có size)
            const sizeObj =
              variant?.sizes?.length > 0
                ? variant.sizes[0] // hoặc size user chọn
                : null;

            // ✅ Xác định stock → ưu tiên size → rồi đến variant → cuối cùng product
            const stock =
              sizeObj?.stock ?? variant?.stock ?? product.stock ?? 0;

            if (stock <= 0) {
              showToast("Sản phẩm đã hết hàng!", "error");
              return;
            }

            // ✅ Kiểm tra giỏ hàng
            const cartData = JSON.parse(localStorage.getItem("cart")) || [];

            const existingItem = cartData.find(
              (item) =>
                item.productId === product._id &&
                item.color === (variant?.color ?? null) &&
                item.size === (sizeObj?.size ?? null)
            );

            const currentQty = existingItem ? existingItem.quantity : 0;

            if (currentQty + 1 > stock) {
              showToast(`Chỉ còn ${stock} sản phẩm!`, "error");
              return;
            }

            // ✅ Thêm vào giỏ
            addToCart({
              productId: product._id,
              color: variant?.color ?? null,
              size: sizeObj?.size ?? null,
              image: selectedImage,
              quantity: 1,
              price: product.price,
              salePrice: discountedPrice,
            });

            showToast("Đã thêm sản phẩm vào giỏ hàng!");
          }}
          className="mt-auto flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-400 hover:text-gray-900 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ
        </button>
      </div>
    </>
  );
};

export default ProductCard;
