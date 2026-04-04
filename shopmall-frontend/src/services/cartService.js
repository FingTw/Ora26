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
};

export default cartService;
