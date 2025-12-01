import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Thiếu productId hoặc rating" });
    }

    // Kiểm tra user đã mua sản phẩm và đơn hàng đã hoàn thành chưa
    const purchased = await Order.findOne({
      userId,
      orderStatus: "Đã hoàn thành",
      "items.productId": productId,
    });

    if (!purchased) {
      return res
        .status(400)
        .json({ message: "Chỉ có thể đánh giá sản phẩm đã mua và hoàn thành" });
    }

    // Kiểm tra người dùng đã review chưa
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
    }

    const review = new Review({
      productId,
      userId,
      rating,
      comment,
    });

    await review.save();

    // Cập nhật trung bình đánh giá và số review trên Product
    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    const averageRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      numReviews,
    });

    res
      .status(201)
      .json({ success: true, message: "Đánh giá thành công", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
