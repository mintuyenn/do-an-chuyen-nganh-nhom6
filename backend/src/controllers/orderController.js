import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";
import mongoose from "mongoose";

// ==========================================
// 1. TẠO ĐƠN HÀNG (COD & VNPAY)
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      shippingAddress,
      paymentMethod,
      items,
      shippingPrice = 0,
      discountAmount: discountVoucher = 0, // giảm giá voucher / chiết khấu riêng
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const orderCode = "ORD" + Date.now();
    const initialPaymentStatus =
      paymentMethod === "COD" ? "Thành công" : "Chưa thanh toán";

    // Lấy giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // 1. Tính tổng giá gốc
    let originalTotal = 0;
    cart.items.forEach((item) => {
      originalTotal += item.price * item.quantity;
    });

    // 2. Lấy giảm giá từ giỏ hàng
    const discountCart = cart.discountAmount || 0;

    // 3. Tính subtotal và tổng tiền
    const subtotalPrice = originalTotal;
    const totalPrice =
      subtotalPrice - discountCart - discountVoucher + shippingPrice;

    // 4. Tạo order
    const newOrder = new Order({
      userId,
      orderCode,
      items,
      shippingInfo: shippingAddress,
      paymentMethod,
      shippingPrice,
      discountCart,
      discountAmount: discountVoucher, // voucher riêng
      subtotalPrice,
      totalPrice,
      paymentStatus: initialPaymentStatus,
      orderStatus: "Chờ xác nhận",
    });

    await newOrder.save();

    // 5. Xóa giỏ hàng
    await Cart.findOneAndUpdate(
      { userId },
      {
        items: [],
        subtotalPrice: 0,
        totalPrice: 0,
        discountAmount: 0,
        appliedDiscountCode: null,
      }
    );

    // 6. Trả kết quả
    if (paymentMethod === "COD") {
      return res.status(201).json({
        success: true,
        message: "Đặt hàng thành công (COD)",
        order: newOrder,
        paymentUrl: null,
      });
    }

    if (paymentMethod === "VNPAY") {
      const paymentUrl = createVnPayUrl(req, newOrder);
      return res.status(201).json({
        success: true,
        message: "Đang chuyển hướng sang VNPAY...",
        order: newOrder,
        paymentUrl,
      });
    }
  } catch (error) {
    console.error("Lỗi tạo đơn:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi tạo đơn hàng", error: error.message });
  }
};

// ==========================================
// 2. HÀM TẠO URL VNPAY
// ==========================================
export const createVnPayUrl = (req, order) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    "127.0.0.1";

  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const amount = Math.round(order.totalPrice * 100);

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: order._id.toString(),
    vnp_OrderInfo: "Thanh toan don hang " + order.orderCode,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  return vnpUrl + "?" + querystring.stringify(vnp_Params, { encode: false });
};

// ==========================================
// 3. XỬ LÝ KẾT QUẢ TRẢ VỀ TỪ VNPAY
// ==========================================
export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      if (rspCode === "00") {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { paymentStatus: "Thành công", paymentMethod: "VNPAY" },
          { new: true }
        );

        if (updatedOrder) {
          return res
            .status(200)
            .json({ code: "00", message: "Thanh toán thành công" });
        } else {
          return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
      } else {
        return res
          .status(400)
          .json({ code: rspCode, message: "Giao dịch thất bại" });
      }
    } else {
      return res
        .status(400)
        .json({ code: "97", message: "Chữ ký không hợp lệ" });
    }
  } catch (error) {
    console.error("VNPAY Return Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ==========================================
// Hàm sắp xếp object
// ==========================================
function sortObject(obj) {
  let sorted = {};
  const str = [];
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key))
      str.push(encodeURIComponent(key));
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// ==========================================
// 4. CÁC HÀM PHỤ TRỢ KHÁC
// ==========================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    res.json({ success: true, data: order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
};

export const updateOrderUserInfo = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.shippingInfo = {
      name: name || order.shippingInfo.name,
      phone: phone || order.shippingInfo.phone,
      address: address || order.shippingInfo.address,
    };

    await order.save();
    res.json({ success: true, message: "Cập nhật thành công", data: order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
// Lấy số sản phẩm đã bán
export const getProductSold = async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await Order.aggregate([
      { $match: { orderStatus: "Đã hoàn thành" } }, // chỉ tính đơn hoàn tất
      { $unwind: "$items" }, // tách mảng items
      {
        $match: {
          "items.productId": new mongoose.Types.ObjectId(productId), // ✅ dùng new
        },
      },
      {
        $group: {
          _id: null,
          sold: { $sum: "$items.quantity" }, // tổng số lượng
        },
      },
    ]);

    const sold = result.length > 0 ? result[0].sold : 0;

    res.json({ sold });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Chỉ hủy khi đơn chưa hoàn thành, chưa hủy, chưa đang giao
    if (
      order.orderStatus === "Đã hoàn thành" ||
      order.orderStatus === "Đã hủy" ||
      order.orderStatus === "Đang giao"
    ) {
      return res.status(400).json({ message: "Đơn hàng không thể hủy" });
    }

    order.orderStatus = "Đã hủy";
    await order.save();

    res.json({ success: true, message: "Đơn hàng đã hủy", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
