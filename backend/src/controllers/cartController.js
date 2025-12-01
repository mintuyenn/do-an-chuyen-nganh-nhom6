import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ======= Lấy giỏ hàng =======
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.json({
        items: [],
        subtotalPrice: 0,
        discountAmount: 0,
        totalPrice: 0,
      });
    }

    // Tính subtotalPrice và discountAmount
    const subtotalPrice = cart.items.reduce(
      (sum, i) => sum + i.salePrice * i.quantity,
      0
    );
    const discountAmount = cart.items.reduce(
      (sum, i) => sum + (i.price - i.salePrice) * i.quantity,
      0
    );
    const totalPrice = subtotalPrice;

    cart.subtotalPrice = subtotalPrice;
    cart.discountAmount = discountAmount;
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======= Thêm sản phẩm vào giỏ =======
export const addToCart = async (req, res) => {
  try {
    const { productId, color, size, quantity, image, price, salePrice } =
      req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.color === color &&
        i.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.salePrice = salePrice;
      existingItem.subtotal = existingItem.quantity * salePrice;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        image,
        color,
        size,
        price,
        salePrice,
        quantity,
        subtotal: salePrice * quantity,
      });
    }

    // Tính subtotalPrice, discountAmount, totalPrice
    const subtotalPrice = cart.items.reduce(
      (sum, i) => sum + i.salePrice * i.quantity,
      0
    );
    const discountAmount = cart.items.reduce(
      (sum, i) => sum + (i.price - i.salePrice) * i.quantity,
      0
    );
    const totalPrice = subtotalPrice;

    cart.subtotalPrice = subtotalPrice;
    cart.discountAmount = discountAmount;
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======= Cập nhật số lượng trong giỏ =======
export const updateCart = async (req, res) => {
  try {
    const { productId, color, size, quantity, salePrice } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(400).json({ message: "Giỏ hàng trống" });

    const item = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.color === color &&
        i.size === size
    );
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i !== item);
    } else {
      item.quantity = quantity;
      if (salePrice) item.salePrice = salePrice;
      item.subtotal = item.quantity * item.salePrice;
    }

    // Tính subtotalPrice, discountAmount, totalPrice
    const subtotalPrice = cart.items.reduce(
      (sum, i) => sum + i.salePrice * i.quantity,
      0
    );
    const discountAmount = cart.items.reduce(
      (sum, i) => sum + (i.price - i.salePrice) * i.quantity,
      0
    );
    const totalPrice = subtotalPrice;

    cart.subtotalPrice = subtotalPrice;
    cart.discountAmount = discountAmount;
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======= Xoá sản phẩm khỏi giỏ =======
export const removeFromCart = async (req, res) => {
  try {
    const { productId, color, size } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.productId.toString() === productId &&
          i.color === color &&
          i.size === size
        )
    );

    // Nếu ko còn item → reset
    if (cart.items.length === 0) {
      cart.subtotalPrice = 0;
      cart.discountAmount = 0;
      cart.totalPrice = 0;
      await cart.save();
      return res.json(cart);
    }

    // Tính subtotalPrice, discountAmount, totalPrice
    const subtotalPrice = cart.items.reduce(
      (sum, i) => sum + i.salePrice * i.quantity,
      0
    );
    const discountAmount = cart.items.reduce(
      (sum, i) => sum + (i.price - i.salePrice) * i.quantity,
      0
    );
    const totalPrice = subtotalPrice;

    cart.subtotalPrice = subtotalPrice;
    cart.discountAmount = discountAmount;
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======= Xoá toàn bộ giỏ =======
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      {
        items: [],
        subtotalPrice: 0,
        discountAmount: 0,
        totalPrice: 0,
      },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
