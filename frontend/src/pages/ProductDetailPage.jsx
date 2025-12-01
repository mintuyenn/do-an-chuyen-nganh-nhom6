import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  ChevronRight,
  Plus,
  Minus,
  Star,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useCart } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [sold, setSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState("/placeholder.png");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);

  // === Fetch Product + Sold ===
  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        // Product
        const res = await axios.get(`http://localhost:5001/api/products/${id}`);
        const p = res.data;
        setProduct(p);

        const v = p.variants?.[0] || null;
        setSelectedVariant(v);

        const firstSize =
          v?.sizes?.find((s) => s.stock > 0) || v?.sizes?.[0] || null;
        setSelectedSize(firstSize);

        setSelectedImage(v?.images?.[0] || p.images?.[0] || "/placeholder.png");

        // Sold
        const soldRes = await axios.get(
          `http://localhost:5001/api/orders/sold/${id}`
        );
        setSold(soldRes.data.sold ?? 0);
      } catch (err) {
        console.error(err);
        setError("Không thể tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    const size =
      variant.sizes?.find((s) => s.stock > 0) || variant.sizes?.[0] || null;
    setSelectedSize(size);
    setSelectedImage(variant.images?.[0] || "/placeholder.png");
    setQuantity(1);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleQuantityChange = (chg) => {
    setQuantity((prev) => {
      const newQty = prev + chg;
      const maxStock =
        selectedSize?.stock ?? selectedVariant?.stock ?? product?.stock ?? 0;
      if (newQty < 1) return 1;
      if (newQty > maxStock) return maxStock;
      return newQty;
    });
  };

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      showToast("Bạn cần đăng nhập để thêm vào giỏ!", "error");
      navigate("/login");
      return;
    }
    const variant = selectedVariant ?? null;
    const sizeObj = selectedSize ?? null;

    const stock = sizeObj?.stock ?? variant?.stock ?? product.stock ?? 0;
    if (stock <= 0) {
      showToast("Sản phẩm đã hết hàng!", "error");
      return;
    }

    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cartData.find(
      (item) =>
        item.productId === product._id &&
        (variant ? item.color === variant.color : true) &&
        (sizeObj ? item.size === sizeObj.size : true)
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > stock) {
      showToast(`Chỉ còn ${stock} sản phẩm!`, "error");
      return;
    }

    await addToCart({
      productId: product._id,
      color: variant?.color ?? null,
      size: sizeObj?.size ?? null,
      image: selectedImage,
      quantity,
      price: product.price,
      salePrice: product.finalPrice ?? product.price,
    });
    showToast(`Sản phẩm đã thêm vào giỏ`, "success");
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading)
    return <div className="animate-pulse text-center py-20">Đang tải...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-20">{error}</div>;
  if (!product)
    return <div className="text-center mt-20">Không có sản phẩm.</div>;

  const discountedPrice = product.finalPrice ?? product.price;
  const originalPrice = product.price;
  const stock =
    selectedSize?.stock ?? selectedVariant?.stock ?? product.stock ?? 0;
  const canAdd = stock > 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white z-50 animate-slide`}
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

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <img
              src={selectedImage}
              className="w-full h-[500px] rounded-lg object-cover"
            />
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {selectedVariant?.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded border ${
                    selectedImage === img ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* ⭐ Rating + Reviews + Sold */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const diff = product.averageRating - i;
                  let starClass = "text-gray-300";
                  if (diff >= 1) starClass = "text-yellow-400";
                  else if (diff > 0) starClass = "text-yellow-400/50";
                  return <Star key={i} size={16} className={starClass} />;
                })}
                <span className="text-gray-500 text-sm">
                  {product.averageRating.toFixed(1)}/5
                </span>
                <span className="text-gray-400 text-sm">
                  ({product.numReviews ?? 0} đánh giá)
                </span>
                <span className="text-gray-400 text-sm">• Đã bán {sold}</span>
                <button
                  onClick={() =>
                    document
                      .getElementById("reviews-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-red-600 text-sm ml-2 underline"
                >
                  Xem đánh giá
                </button>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-red-600">
                {discountedPrice.toLocaleString("vi-VN")}đ
              </span>
              {discountedPrice < originalPrice && (
                <span className="ml-3 line-through text-gray-400 text-xl">
                  {originalPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            {/* Color */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">
                Màu: {selectedVariant?.color}
              </h3>
              <div className="flex gap-2">
                {product.variants?.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => handleVariantSelect(v)}
                    className={`w-10 h-10 rounded-full border-2 overflow-hidden ${
                      selectedVariant?._id === v._id
                        ? "border-red-500 scale-110"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={v.images?.[0]}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            {selectedVariant?.sizes && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">
                  Kích cỡ: {selectedSize?.size}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.sizes.map((s) => (
                    <button
                      key={s._id}
                      disabled={s.stock === 0}
                      onClick={() => handleSizeSelect(s)}
                      className={`px-4 py-2 rounded border text-sm ${
                        selectedSize?._id === s._id
                          ? "bg-red-600 text-white"
                          : "border-gray-300"
                      } ${s.stock === 0 ? "bg-gray-100 text-gray-400" : ""}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="px-3 py-2 border rounded disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 border">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
                className="px-3 py-2 border rounded disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
              <span className="text-sm text-gray-500">
                {stock > 0 ? `${stock} sản phẩm còn trong kho` : "Hết hàng"}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="flex-1 border border-red-600 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 disabled:bg-gray-200"
              >
                <ShoppingCart className="inline mr-2" /> Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAdd}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
              >
                Mua ngay
              </button>
            </div>

            <div className="border-t pt-4 text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={18} /> Giao hàng toàn quốc
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} /> Đổi trả trong 30 ngày
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4 tracking-wide uppercase text-gray-800">
            Mô tả sản phẩm
          </h2>
          <p className="whitespace-pre-line text-gray-700 leading-relaxed mb-6">
            {product.description || "Chưa có mô tả."}
            {"\n\n"}• Chất liệu cotton 100%, mềm mại, thoáng mát{"\n"}• Thấm hút
            mồ hôi tốt, phù hợp cho mọi hoạt động{"\n"}• Thiết kế hiện đại, trẻ
            trung, phù hợp nhiều hoàn cảnh{"\n"}• Màu sắc đa dạng, dễ phối đồ
            {"\n"}• Dễ giặt, ít bị nhăn và co rút{"\n"}• Các size từ S đến XL,
            phù hợp nhiều vóc dáng{"\n"}• Phù hợp làm quà tặng hoặc mặc hàng
            ngày
          </p>
        </div>

        {/* Reviews Section */}
        <div
          id="reviews-section"
          className="bg-white rounded-xl shadow p-6 mt-8"
        >
          <h2 className="text-xl font-bold mb-6 tracking-wide uppercase text-gray-800">
            Đánh giá sản phẩm
          </h2>

          {product.reviews?.length > 0 ? (
            <div className="flex flex-col gap-4">
              {product.reviews.map((r) => (
                <div
                  key={r._id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar giả lập chữ cái đầu */}
                      <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                        {r.userId.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.userId.fullName}
                        </p>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < r.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
