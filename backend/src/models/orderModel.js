import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  color: String,
  size: String,
  subtotal: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderCode: { type: String, unique: true },
    items: [orderItemSchema],

    // Các trường giá tiền
    subtotalPrice: { type: Number, required: true },
    discountCart: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },

    // ✅ CẬP NHẬT: Thêm paymentMethod để tránh lỗi khi lưu
    paymentMethod: {
      type: String,
      enum: ["COD", "VNPAY"],
      default: "COD",
    },

    // ✅ CẬP NHẬT: Enum phải khớp với Controller
    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Thành công", "Thất bại"],
      default: "Chưa thanh toán",
    },

    orderStatus: {
      type: String,
      enum: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang giao",
        "Đã hoàn thành",
        "Đã hủy",
      ],
      default: "Chờ xác nhận",
    },

    shippingInfo: {
      name: String,
      phone: String,
      address: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
