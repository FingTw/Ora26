import api from "./api";

const productService = {
  // Lấy toàn bộ danh sách sản phẩm
  getAllProducts: async () => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi tải sản phẩm!" };
    }
  },
};

export default productService;
