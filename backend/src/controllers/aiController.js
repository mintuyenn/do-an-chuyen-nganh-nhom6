import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/categogyModel.js";
import Order from "../models/orderModel.js";

// =====================================================================
// TOOL 1: Tìm kiếm sản phẩm
// Logic: Tìm theo tên, tính tổng tồn kho từ các biến thể (Variant/Size)
// =====================================================================
const aiSearchProducts = asyncHandler(async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.json({ found: false, message: "Vui lòng cung cấp từ khóa." });
  }

  // Tìm kiếm gần đúng theo tên (không phân biệt hoa thường)
  const products = await Product.find({
    name: { $regex: keyword, $options: "i" },
  })
    .limit(5) // Lấy tối đa 5 sản phẩm để AI không bị loạn
    .select("name price description variants images");

  if (products.length === 0) {
    return res.json({ found: false, message: "Không tìm thấy sản phẩm nào." });
  }

  // Xử lý dữ liệu gọn gàng cho AI đọc
  const result = products.map((p) => {
    // Tính tổng tồn kho từ cấu trúc: variants -> sizes -> stock
    let totalStock = 0;
    let colors = [];

    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((variant) => {
        if (variant.color) colors.push(variant.color);
        if (variant.sizes && Array.isArray(variant.sizes)) {
          variant.sizes.forEach((sizeItem) => {
            totalStock += sizeItem.stock || 0;
          });
        }
      });
    }

    return {
      name: p.name,
      price: p.price ? p.price.toLocaleString("vi-VN") + " đ" : "Liên hệ",
      status: totalStock > 0 ? `Còn hàng (Tổng: ${totalStock})` : "Hết hàng",
      colors: colors.join(", "), // Ví dụ: Vàng nhạt, Xanh
      description: p.description || "",
      image: p.images && p.images.length > 0 ? p.images[0] : "",
    };
  });

  res.json({
    found: true,
    data: result,
  });
});

// =====================================================================
// TOOL 2: Lấy danh mục sản phẩm
// Logic: Lấy tên các danh mục để AI biết shop bán gì
// =====================================================================
const aiGetCategories = asyncHandler(async (req, res) => {
  // Chỉ lấy tên danh mục
  const categories = await Category.find({}).select("name");

  const categoryNames = categories.map((c) => c.name).join(", ");

  res.json({
    message: "Danh sách danh mục hiện có của shop",
    data: categoryNames, // VD: Phụ kiện, Áo thun, Áo polo
  });
});

// =====================================================================
// TOOL 3: Tra cứu đơn hàng
// Logic: Tìm theo orderCode (VD: ORD1764218080714) vì khách sẽ nhớ mã này
// =====================================================================
const aiCheckOrder = asyncHandler(async (req, res) => {
  const { orderCode } = req.body;

  if (!orderCode) {
    return res.json({
      found: false,
      message: "Vui lòng cung cấp mã đơn hàng (Ví dụ: ORD...)",
    });
  }

  // Tìm chính xác theo orderCode (Dựa vào ảnh 2 bạn gửi)
  const order = await Order.findOne({ orderCode: orderCode });

  if (order) {
    // Format lại ngày tháng
    const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");

    res.json({
      found: true,
      orderCode: order.orderCode,
      status: order.orderStatus, // VD: Đã hoàn thành
      paymentStatus: order.paymentStatus, // VD: Thành công
      paymentMethod: order.paymentMethod, // VD: COD
      totalPrice: order.totalPrice.toLocaleString("vi-VN") + " đ",
      orderDate: orderDate,
    });
  } else {
    res.json({
      found: false,
      message: `Không tìm thấy đơn hàng có mã ${orderCode}. Vui lòng kiểm tra lại.`,
    });
  }
});

export { aiSearchProducts, aiGetCategories, aiCheckOrder };
