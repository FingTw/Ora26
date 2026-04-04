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

  // ✅ HÀM CẬP NHẬT SỐ LƯỢNG (CÓ TÍNH LẠI THÀNH TIỀN)
  const updateQuantity = async (masp, soluong_moi) => {
    // Kiểm tra số lượng hợp lệ
    if (soluong_moi < 1) {
      // Nếu số lượng < 1 thì xóa sản phẩm
      await removeItem(masp);
      return;
    }

    try {
      // 1. Gọi API cập nhật số lượng trong database
      await cartService.updateCartItem(masp, soluong_moi);
      
      // 2. Cập nhật local state ngay lập tức (optimistic update)
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.MASP === masp 
            ? { 
                ...item, 
                SOLUONG: soluong_moi,
                THANHTIEN: item.DONGIA * soluong_moi  // Tính lại thành tiền
              } 
            : item
        )
      );
      
      // 3. Refresh lại toàn bộ giỏ hàng để đồng bộ với database
      await fetchCartItems();
      
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      // Nếu lỗi, refresh lại để hiển thị dữ liệu đúng từ database
      await fetchCartItems();
    }
  };

  // ✅ HÀM XÓA SẢN PHẨM KHỎI GIỎ
  const removeItem = async (masp) => {
    try {
      // Gọi API cập nhật số lượng = 0 (sẽ xóa khỏi database)
      await cartService.updateCartItem(masp, 0);
      
      // Cập nhật local state: lọc bỏ sản phẩm bị xóa
      setCartItems(prevItems => prevItems.filter(item => item.MASP !== masp));
      
      // Refresh lại số lượng
      await fetchCartCount();
      
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      // Nếu lỗi, refresh lại toàn bộ
      await fetchCartItems();
    }
  };

  // ✅ HÀM TĂNG SỐ LƯỢNG
  const increaseQuantity = async (masp, currentQuantity) => {
    await updateQuantity(masp, currentQuantity + 1);
  };

  // ✅ HÀM GIẢM SỐ LƯỢNG
  const decreaseQuantity = async (masp, currentQuantity) => {
    if (currentQuantity > 1) {
      await updateQuantity(masp, currentQuantity - 1);
    } else {
      await removeItem(masp);
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
      increaseQuantity,    // ✅ Thêm hàm tăng
      decreaseQuantity     // ✅ Thêm hàm giảm
    }}>
      {children}
    </CartContext.Provider>
  );
};