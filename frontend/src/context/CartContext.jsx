// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [totals, setTotals] = useState({
    subtotalPrice: 0,
    totalPrice: 0,
  });

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = (items) => {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  const token = localStorage.getItem("token");

  // ✅ Lấy giỏ hàng
  const fetchCart = async () => {
    if (!token) return;

    try {
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data);
      updateCartCount(res.data.items || []);
      setTotals({
        subtotalPrice: res.data.subtotalPrice,
        discountAmount: res.data.discountAmount,
        totalPrice: res.data.totalPrice,
      });
    } catch (err) {
      console.log("Lỗi lấy giỏ hàng:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  // ✅ Thêm giỏ
  const addToCart = async (item) => {
    try {
      const res = await api.post(
        "/cart/add",
        {
          productId: item.productId,
          color: item.color,
          size: item.size,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          salePrice: item.salePrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart(res.data);
      updateCartCount(res.data.items || []);
      setTotals({
        subtotalPrice: res.data.subtotalPrice,
        totalPrice: res.data.totalPrice,
      });
    } catch (err) {
      console.log("Thêm giỏ hàng lỗi:", err.response?.data || err);
    }
  };

  // ✅ Cập nhật số lượng
  const updateCart = async ({ productId, color, size, quantity }) => {
    try {
      const res = await api.put(
        "/cart/update",
        { productId, color, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart(res.data);
      updateCartCount(res.data.items || []);
      setTotals({
        subtotalPrice: res.data.subtotalPrice,
        totalPrice: res.data.totalPrice,
      });
    } catch (err) {
      console.log("❌ Cập nhật giỏ lỗi:", err.response?.data || err);
    }
  };

  // ✅ Xoá sản phẩm
  const removeFromCart = async ({ productId, color, size }) => {
    try {
      const res = await api.delete("/cart/remove", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId, color, size },
      });

      setCart(res.data);
      updateCartCount(res.data.items || []);
      setTotals({
        subtotalPrice: res.data.subtotalPrice,
        totalPrice: res.data.totalPrice,
      });
    } catch (err) {
      console.log("❌ Xoá lỗi:", err.response?.data || err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totals,
        cartCount,
        fetchCart,
        addToCart,
        updateCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line
export const useCart = () => useContext(CartContext);
