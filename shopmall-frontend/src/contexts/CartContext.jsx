// shopmall-frontend/src/contexts/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import cartService from "../services/cartService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = async () => {
    const userString = localStorage.getItem("user");
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

  const fetchCartItems = async () => {
    const userString = localStorage.getItem("user");
    if (userString && userString !== "undefined") {
      setLoading(true);
      try {
        const res = await cartService.getCart();
        if (res && res.success) {
          console.log("🛒 fetchCartItems - Dữ liệu từ server:", res.data);
          setCartItems(res.data);
          setCartCount(res.data.length);
        }
      } catch (error) {
        console.error("Không lấy được chi tiết giỏ hàng:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  };

  // ✅ HÀM CẬP NHẬT SỐ LƯỢNG - ĐÃ SỬA LỖI ĐỒNG BỘ
  const updateQuantity = async (masp, soluong_moi) => {
    // Kiểm tra số lượng hợp lệ
    if (soluong_moi < 1) {
      await removeItem(masp);
      return;
    }

    try {
      console.log("🔄 updateQuantity - MASP:", masp, "SL mới:", soluong_moi);
      
      // 1. Gọi API cập nhật số lượng trong database
      await cartService.updateCartItem(masp, soluong_moi);
      
      // 2. ✅ QUAN TRỌNG: Refresh lại toàn bộ giỏ hàng từ server
      //    Không dùng optimistic update để tránh mất đồng bộ
      await fetchCartItems();
      await fetchCartCount();
      
      console.log("✅ updateQuantity - Thành công, đã refresh giỏ hàng");
      
    } catch (error) {
      console.error("❌ Lỗi cập nhật số lượng:", error);
      alert(error.message || "Không thể cập nhật số lượng!");
      // Refresh lại để hiển thị dữ liệu đúng từ database
      await fetchCartItems();
    }
  };

  // ✅ HÀM XÓA SẢN PHẨM - ĐÃ SỬA LỖI ĐỒNG BỘ
  const removeItem = async (masp) => {
    try {
      console.log("🗑️ removeItem - MASP:", masp);
      
      // Gọi API cập nhật số lượng = 0 (sẽ xóa khỏi database)
      await cartService.updateCartItem(masp, 0);
      
      // ✅ Refresh lại toàn bộ giỏ hàng từ server
      await fetchCartItems();
      await fetchCartCount();
      
      console.log("✅ removeItem - Thành công, đã refresh giỏ hàng");
      
    } catch (error) {
      console.error("❌ Lỗi xóa sản phẩm:", error);
      alert(error.message || "Không thể xóa sản phẩm!");
      // Refresh lại để hiển thị dữ liệu đúng từ database
      await fetchCartItems();
    }
  };

  // ✅ HÀM TĂNG SỐ LƯỢNG
  const increaseQuantity = async (masp, currentQuantity) => {
    console.log("➕ increaseQuantity - MASP:", masp, "Current:", currentQuantity);
    await updateQuantity(masp, currentQuantity + 1);
  };

  // ✅ HÀM GIẢM SỐ LƯỢNG
  const decreaseQuantity = async (masp, currentQuantity) => {
    console.log("➖ decreaseQuantity - MASP:", masp, "Current:", currentQuantity);
    if (currentQuantity > 1) {
      await updateQuantity(masp, currentQuantity - 1);
    } else {
      // Nếu chỉ còn 1 sản phẩm, hỏi người dùng có muốn xóa không
      const confirmDelete = window.confirm("Sản phẩm chỉ còn 1. Bạn có muốn xóa khỏi giỏ hàng?");
      if (confirmDelete) {
        await removeItem(masp);
      }
    }
  };

  // ✅ HÀM XÓA TOÀN BỘ GIỎ HÀNG
  const clearCart = async () => {
    if (cartItems.length === 0) return;
    
    const confirmClear = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
    if (!confirmClear) return;
    
    try {
      // Xóa từng sản phẩm một
      for (const item of cartItems) {
        await cartService.updateCartItem(item.MASP, 0);
      }
      // Refresh lại giỏ hàng
      await fetchCartItems();
      await fetchCartCount();
      alert("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      console.error("Lỗi xóa toàn bộ giỏ:", error);
      alert("Không thể xóa toàn bộ giỏ hàng!");
      await fetchCartItems();
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      cartItems,
      loading,
      fetchCartCount, 
      fetchCartItems,
      updateQuantity,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      clearCart  // ✅ Thêm hàm xóa toàn bộ giỏ
    }}>
      {children}
    </CartContext.Provider>
  );
};