import Product from "../models/productModel.js";
import Category from "../models/categogyModel.js";
import Discount from "../models/discountModel.js";
import Order from "../models/orderModel.js"; // để tính sold
import Review from "../models/reviewModel.js"; // thêm import

/* ---------------------- HÀM PHỤ TRỢ ---------------------- */

// 🧩 Đệ quy lấy ID danh mục con
const getAllChildCategoryIds = async (parentId) => {
  const children = await Category.find({ parentId });
  let ids = children.map((c) => c._id);
  for (const child of children) {
    const childIds = await getAllChildCategoryIds(child._id);
    ids = ids.concat(childIds);
  }
  return ids;
};

// 🔹 Áp dụng giảm giá cho Home / Product list (CHỈ percent)
const applyDiscountsForHome = (products, discounts) => {
  const validDiscounts = discounts
    .filter(
      (d) =>
        d.isActive &&
        (!d.startDate || new Date() >= d.startDate) &&
        (!d.endDate || new Date() <= d.endDate) &&
        d.discountType === "percent"
    )
    .sort((a, b) => a.priority - b.priority); // ưu tiên thấp trước

  return products.map((product) => {
    let originalPrice = product.price;
    let bestFinalPrice = originalPrice;
    let appliedDiscount = null;

    for (const discount of validDiscounts) {
      // Nếu discount áp dụng sản phẩm cụ thể
      if (
        discount.applicableProducts.length > 0 &&
        !discount.applicableProducts.some(
          (id) => id.toString() === product._id.toString()
        )
      )
        continue;

      const tempPrice =
        originalPrice - (originalPrice * discount.discountValue) / 100;

      if (tempPrice < bestFinalPrice) {
        bestFinalPrice = tempPrice;
        appliedDiscount = discount;
      }
    }

    return {
      ...product.toObject(),
      finalPrice: Math.round(bestFinalPrice),
      discountInfo: appliedDiscount
        ? {
            name: appliedDiscount.name,
            value: appliedDiscount.discountValue,
            type: appliedDiscount.discountType,
            priority: appliedDiscount.priority,
          }
        : null,
    };
  });
};

// 🔹 Áp dụng giảm giá khi Checkout
const applyDiscountsForCheckout = (products, discounts) => {
  // sắp xếp giảm giá theo priority tăng dần
  const sorted = discounts.sort((a, b) => a.priority - b.priority);

  return products.map((product) => {
    const originalPrice = product.price;
    let bestFinalPrice = originalPrice;
    let appliedDiscount = null;

    for (const discount of sorted) {
      if (!discount.isActive) continue;

      // Kiểm tra áp dụng sản phẩm
      if (
        discount.applicableProducts.length > 0 &&
        !discount.applicableProducts.some(
          (id) => id.toString() === product._id.toString()
        )
      )
        continue;

      let tempPrice = originalPrice;

      if (discount.discountType === "holiday") {
        tempPrice = Math.max(0, originalPrice - discount.discountValue);
      }

      if (discount.discountType === "percent") {
        tempPrice =
          originalPrice - (originalPrice * discount.discountValue) / 100;
      }

      if (tempPrice < bestFinalPrice) {
        bestFinalPrice = tempPrice;
        appliedDiscount = discount;
      }
    }

    return {
      ...product,
      finalPrice: Math.round(bestFinalPrice),
      discountInfo: appliedDiscount
        ? {
            name: appliedDiscount.name,
            value: appliedDiscount.discountValue,
            type: appliedDiscount.discountType,
            priority: appliedDiscount.priority,
          }
        : null,
    };
  });
};

/* ---------------------- API CHÍNH ---------------------- */

// ✅ Lấy tất cả sản phẩm của category (bao gồm con cháu)
export const getProductsByCategoryTree = async (req, res) => {
  try {
    const { id } = req.params;
    const allCategoryIds = await getAllChildCategoryIds(id);
    allCategoryIds.push(id);

    const products = await Product.find({ categoryId: { $in: allCategoryIds } })
      .populate("categoryId")
      .sort({ createdAt: -1 });

    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    const updated = applyDiscountsForHome(products, activeDiscounts);
    res.json({ data: updated, count: updated.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lấy tất cả sản phẩm (lọc + phân trang + sort + metadata)
export const getProducts = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      color,
      categoryId,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    let filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (minPrice && maxPrice)
      filters.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    else if (minPrice) filters.price = { $gte: Number(minPrice) };
    else if (maxPrice) filters.price = { $lte: Number(maxPrice) };
    if (color) filters["variants.color"] = color;

    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else if (sort === "name_asc") sortOption.name = 1;
    else if (sort === "name_desc") sortOption.name = -1;

    const skip = (page - 1) * limit;
    const products = await Product.find(filters)
      .populate("categoryId")
      .sort(sortOption)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Product.countDocuments(filters);

    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    const updated = applyDiscountsForHome(products, activeDiscounts);

    res.json({
      data: updated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId"
    );
    if (!product)
      return res.status(404).json({ error: "Product không tồn tại" });

    // Lấy tất cả review cho product
    const reviews = await Review.find({ productId: product._id }).populate(
      "userId",
      "fullName"
    );

    // Tính số lượng và trung bình
    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    // Lấy số đã bán từ Order
    const result = await Order.aggregate([
      { $match: { orderStatus: "Đã hoàn thành" } },
      { $unwind: "$items" },
      { $match: { "items.productId": product._id } },
      { $group: { _id: null, sold: { $sum: "$items.quantity" } } },
    ]);
    const sold = result.length > 0 ? result[0].sold : 0;

    // Áp dụng giảm giá
    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });
    const [updatedProduct] = applyDiscountsForHome([product], activeDiscounts);

    res.json({
      ...updatedProduct,
      averageRating,
      numReviews,
      sold,
      reviews,
    });
  } catch (err) {
    console.error("getProductById error:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ Lấy sản phẩm mới nhất
export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(20);

    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    const updated = applyDiscountsForHome(products, activeDiscounts);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Checkout API (áp dụng tất cả loại giảm giá)
export const checkoutProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Thiếu products để thanh toán" });
    }

    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
    });

    const updatedProducts = applyDiscountsForCheckout(products, discounts);
    const totalAmount = updatedProducts.reduce(
      (sum, p) => sum + p.finalPrice * (p.quantity || 1),
      0
    );

    res.json({
      success: true,
      data: updatedProducts,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const regex = new RegExp(q, "i");

    // 1️⃣ Lấy tất cả category khớp query
    const matchingCategories = await Category.find({ name: regex });
    let categoryIds = matchingCategories.map((c) => c._id);

    // 2️⃣ Lấy tất cả sản phẩm khớp tên / mô tả hoặc category
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { categoryId: { $in: categoryIds } },
      ],
    }).populate("categoryId");

    // 3️⃣ Lấy giảm giá đang hoạt động
    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    // 4️⃣ Áp dụng giảm giá
    const updated = applyDiscountsForHome(products, activeDiscounts);

    res
      .status(200)
      .json({ success: true, data: updated, count: updated.length });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/products/related/:id
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Lấy tất cả category con + category hiện tại
    const allCategoryIds = await getAllChildCategoryIds(product.categoryId);
    allCategoryIds.push(product.categoryId);

    // Lấy sản phẩm cùng category tree, loại trừ sản phẩm hiện tại
    const related = await Product.find({
      categoryId: { $in: allCategoryIds },
      _id: { $ne: product._id },
    })
      .limit(10) // lấy tối đa 10 sản phẩm
      .populate("categoryId")
      .sort({ createdAt: -1 });

    // Áp dụng giảm giá
    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    const updated = applyDiscountsForHome(related, activeDiscounts);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
