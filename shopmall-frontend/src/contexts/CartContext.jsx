import { createContext, useState, useEffect } from "react";
import cartService from "../services/cartService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const userString = localStorage.getItem("user");
    // Chỉ gọi API nếu khách đã đăng nhập
    if (userString && userString !== "undefined") {
      try {
        const res = await cartService.getCartCount();
        if (res && res.success) {
          setCartCount(Number(res.count) || 0);
        }
      } catch (error) {
        console.error("Không lấy được số lượng giỏ hàng:", error);
      }
    } else {
      setCartCount(0);
    }
  };
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
