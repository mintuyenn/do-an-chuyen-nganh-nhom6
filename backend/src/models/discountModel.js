import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, // Tên chương trình giảm giá

    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    }, // Mã voucher (nếu có)

    discountType: {
      type: String,
      enum: ["percent", "fixed", "quantity", "holiday"],
      required: true,
    }, // Loại giảm giá

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    }, // Giá trị giảm (% hoặc tiền)

    priority: {
      type: Number,
      default: 0,
    }, // Mức độ ưu tiên (số càng cao -> ưu tiên càng cao)

    startDate: {
      type: Date,
      default: Date.now,
    }, // Ngày bắt đầu

    endDate: {
      type: Date,
    }, // Ngày kết thúc

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ], // Áp dụng cho sản phẩm cụ thể (nếu có)
    description: {
      type: String,
      trim: true,
      default: "",
    }, // Mô tả chương trình giảm giá

    isActive: {
      type: Boolean,
      default: true,
    }, // Còn hiệu lực hay không
  },
  { timestamps: true }
);

// 🔹 Virtual field — kiểm tra đã hết hạn chưa
discountSchema.virtual("isExpired").get(function () {
  return this.endDate ? new Date() > this.endDate : false;
});

// 🔹 Virtual field — kiểm tra còn hiệu lực không
discountSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    (!this.startDate || now >= this.startDate) &&
    (!this.endDate || now <= this.endDate)
  );
});

// 🔹 Index giúp tìm nhanh các giảm giá còn hiệu lực
discountSchema.index({ code: 1, isActive: 1 });

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;
