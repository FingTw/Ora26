// shopmall-frontend/src/services/cartService.js
import api from "./api";

const cartService = {
  addToCart: async (data) => {
    try {
      const response = await api.post("/cart/add", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server!" };
    }
  },
  
  getCartCount: async () => {
    try {
      const response = await api.get("/cart/count");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi tải số lượng giỏ hàng!" };
    }
  },
  
  getCart: async () => {
    try {
      console.log("📡 Calling API: GET /cart");
      const response = await api.get("/cart");
      console.log("📡 API Response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ API Error:", error);
      throw error.response?.data || { message: "Lỗi tải giỏ hàng!" };
    }
  },
  
  updateCartItem: async (masp, soluong_moi) => {
    try {
      const response = await api.put("/cart/update", { masp, soluong_moi });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi cập nhật giỏ hàng!" };
    }
  }
};

export default cartService;