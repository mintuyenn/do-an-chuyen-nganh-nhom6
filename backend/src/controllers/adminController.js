import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categogyModel.js";
import Discount from "../models/discountModel.js"; // Tạo model Mã giảm giá

// 📊 1. Thống kê Dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // Tổng doanh thu (chỉ tính đơn đã hoàn thành)
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: "Đã hoàn thành" } }, // lọc đơn hoàn thành
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Tổng số đơn đã hoàn thành
    const totalOrders = await Order.countDocuments({
      orderStatus: "Đã hoàn thành",
    });

    // Tổng số sản phẩm
    const totalProducts = await Product.countDocuments();

    // Tổng số user có role="user"
    const totalUsers = await User.countDocuments({ role: "user" });

    // Biểu đồ doanh thu 7 ngày gần nhất (chỉ đơn hoàn thành)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: "Đã hoàn thành",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5 đơn mới nhất (chỉ đơn hoàn thành)
    const recentOrders = await Order.find({ orderStatus: "Đã hoàn thành" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName username email");

    res.json({
      success: true,
      stats: { totalRevenue, totalOrders, totalProducts, totalUsers },
      chartData: dailyRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi thống kê" });
  }
};

// 👥 2. Quản lý Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa người dùng" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa user" });
  }
};

// 📦 3. Quản lý Đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // CHỈ TRỪ KHO KHI:
    // - chuyển sang "Đang giao"
    const shouldSubtractStock =
      (status === "Đang giao" && order.orderStatus !== "Đang giao") ||
      (status === "Đã hoàn thành" && order.orderStatus !== "Đã hoàn thành");

    if (shouldSubtractStock) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const variantIndex = product.variants.findIndex(
          (v) => v.color === item.color
        );
        if (variantIndex === -1) continue;

        const variant = product.variants[variantIndex];

        // ============================
        // TRƯỜNG HỢP 1: size = "Free"
        // → trừ stock theo màu
        // ============================
        if (item.size === "Free") {
          const sizeIndex = variant.sizes.findIndex((s) => s.size === "Free");
          if (sizeIndex !== -1) {
            variant.sizes[sizeIndex].stock -= item.quantity;
            if (variant.sizes[sizeIndex].stock < 0)
              variant.sizes[sizeIndex].stock = 0;
          }
        }

        // ============================
        // TRƯỜNG HỢP 2: size khác "Free"
        // → trừ theo size đúng
        // ============================
        else {
          const sizeIndex = variant.sizes.findIndex(
            (s) => s.size === item.size
          );

          if (sizeIndex !== -1) {
            variant.sizes[sizeIndex].stock -= item.quantity;
            if (variant.sizes[sizeIndex].stock < 0)
              variant.sizes[sizeIndex].stock = 0;
          }
        }

        product.markModified("variants");
        await product.save();
      }
    }

    // cập nhật trạng thái
    order.orderStatus = status;
    await order.save();

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ==========================================
// QUẢN LÝ SẢN PHẨM (NÂNG CẤP VARIANTS)
// ==========================================

// 1. Lấy danh sách
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 2. Tạo sản phẩm mới
export const createProductAdmin = async (req, res) => {
  try {
    const { name, price, description, category, image, variants } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: "Thiếu tên hoặc giá" });

    // Xử lý Category
    let catId = null;
    if (category) {
      let catDoc = await Category.findOne({
        name: { $regex: new RegExp("^" + category + "$", "i") },
      });
      if (!catDoc) {
        catDoc = await Category.create({
          name: category,
          slug: category.toLowerCase(),
        });
      }
      catId = catDoc._id;
    }

    // Xử lý Variants & Tính tổng kho
    let finalVariants = [];
    let totalStock = 0;

    if (variants && Array.isArray(variants) && variants.length > 0) {
      finalVariants = variants;
      // Tính tổng tồn kho từ tất cả các size
      finalVariants.forEach((v) => {
        if (v.sizes) v.sizes.forEach((s) => (totalStock += Number(s.stock)));
      });
    } else {
      // Nếu không nhập variant, tạo mặc định
      totalStock = Number(req.body.countInStock) || 0;
      finalVariants = [
        {
          color: "Mặc định",
          sizes: [{ size: "Free", stock: totalStock }],
          images: image ? [image] : [],
        },
      ];
    }

    const product = new Product({
      user: req.user._id,
      name,
      price: Number(price),
      description: description || "",
      categoryId: catId,
      images: image ? [image] : [],
      variants: finalVariants, // ✅ Lưu chi tiết biến thể
      image: image || "",
      countInStock: totalStock, // ✅ Lưu tổng tự tính
      category: category || "",
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      message: "Tạo thành công",
      product: createdProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// 3. Cập nhật sản phẩm (Sửa logic Variant)
export const updateProductAdmin = async (req, res) => {
  try {
    const { name, price, description, image, category, variants } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.description = description || product.description;

      if (category) {
        let catDoc = await Category.findOne({
          name: { $regex: new RegExp("^" + category + "$", "i") },
        });
        if (!catDoc)
          catDoc = await Category.create({
            name: category,
            slug: category.toLowerCase(),
          });
        product.categoryId = catDoc._id;
      }

      if (image) {
        product.image = image;
        product.images = [image];
      }

      // ✅ CẬP NHẬT VARIANTS CHI TIẾT
      if (variants && Array.isArray(variants)) {
        product.variants = variants;

        // Tự động tính lại tổng kho countInStock
        let newTotalStock = 0;
        variants.forEach((v) => {
          if (v.sizes)
            v.sizes.forEach((s) => (newTotalStock += Number(s.stock)));
        });
        product.countInStock = newTotalStock;

        product.markModified("variants"); // lưu mảng lồng nhau
      }

      const updatedProduct = await product.save();
      res.json({
        success: true,
        message: "Cập nhật thành công",
        product: updatedProduct,
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Xóa sản phẩm
export const deleteProductAdmin = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 1. Lấy danh sách mã giảm giá
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json({ success: true, data: discounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách mã giảm giá" });
  }
};

// 2. Tạo mã giảm giá mới
export const createDiscount = async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      priority,
      startDate,
      endDate,
      applicableProducts,
      applicableUsers,
      description,
      isActive,
    } = req.body;

    // Kiểm tra bắt buộc
    if (!name || !discountType || discountValue == null) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Chỉ bắt buộc code nếu không phải percent
    if (discountType !== "percent" && (!code || code.trim() === "")) {
      return res.status(400).json({ message: "Code là bắt buộc" });
    }

    const discount = new Discount({
      name,
      code: code || "", // nếu percent có thể để trống
      discountType,
      discountValue,
      priority: priority || 0,
      startDate,
      endDate,
      applicableProducts: applicableProducts || [],
      applicableUsers: applicableUsers || [],
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const newDiscount = await discount.save();
    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      discount: newDiscount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 3. Cập nhật mã giảm giá
export const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount)
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });

    const {
      name,
      code,
      discountType,
      discountValue,
      priority,
      startDate,
      endDate,
      applicableProducts,
      applicableUsers,
      description,
      isActive,
    } = req.body;

    discount.name = name || discount.name;
    discount.discountType = discountType || discount.discountType;
    discount.discountValue =
      discountValue !== undefined ? discountValue : discount.discountValue;
    discount.priority = priority !== undefined ? priority : discount.priority;
    discount.startDate = startDate || discount.startDate;
    discount.endDate = endDate || discount.endDate;
    discount.applicableProducts =
      applicableProducts || discount.applicableProducts;
    discount.applicableUsers = applicableUsers || discount.applicableUsers;
    discount.description = description || discount.description;
    discount.isActive = isActive !== undefined ? isActive : discount.isActive;

    // Chỉ cập nhật code nếu discountType không phải percent
    if (discount.discountType !== "percent") {
      if (!code || code.trim() === "") {
        return res.status(400).json({ message: "Code là bắt buộc" });
      }
      discount.code = code;
    } else {
      discount.code = code || ""; // percent có thể bỏ trống
    }

    const updatedDiscount = await discount.save();
    res.json({
      success: true,
      message: "Cập nhật thành công",
      discount: updatedDiscount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Xóa mã giảm giá
export const deleteDiscount = async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Xóa mã giảm giá thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
