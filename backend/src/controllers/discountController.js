import Discount from "../models/discountModel.js";

/** 🟡 Lấy tất cả giảm giá */
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate("applicableProducts");
    res.json({ success: true, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** 🟢 Lấy các mã đang hoạt động */
export const getActiveDiscounts = async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
    });
    res.json({ success: true, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** 🔵 Lấy chi tiết giảm giá theo ID */
export const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** ✅ KIỂM TRA MÃ GIẢM GIÁ (Chỉ còn holiday + percent) */
export const validateDiscount = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    // 1. Tìm mã giảm giá hợp lệ
    const discount = await Discount.findOne({
      code,
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
      });
    }

    // 2. Tính toán giảm giá
    let discountAmount = 0;

    if (discount.discountType === "holiday") {
      // Giảm theo giá trị cố định (holiday)
      discountAmount = discount.discountValue;
    }

    if (discount.discountType === "percent") {
      // Giảm theo % tổng hóa đơn
      discountAmount = Math.round((subtotal * discount.discountValue) / 100);
    }

    // Không cho giảm quá tổng tiền
    discountAmount = Math.min(discountAmount, subtotal);

    return res.status(200).json({
      success: true,
      message: "Áp dụng mã thành công!",
      discountAmount,
      code: discount.code,
      type: discount.discountType,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi kiểm tra mã" });
  }
};
/** 🟣 Lấy 3 mã giảm giá holiday mới nhất */
export const getLatestHolidayDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find({
      discountType: "holiday",
    })
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(3); // Lấy 3 mã

    return res.json({
      success: true,
      data: discounts,
    });
  } catch (error) {
    console.error("Lỗi lấy mã giảm giá holiday mới nhất:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy mã giảm giá holiday",
    });
  }
};
