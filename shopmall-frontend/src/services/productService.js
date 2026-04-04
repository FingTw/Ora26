import api from "./api";

const productService = {
  // ✅ Lấy sản phẩm có phân trang (DÙNG CHO TRANG CHỦ)
  getProducts: async (page = 1, limit = 12) => {
    try {
      const response = await api.get('/products', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProducts:", error);
      throw error.response?.data || { message: "Lỗi tải sản phẩm!" };
    }
  },
  
  // ✅ Lấy sản phẩm theo danh mục có phân trang
  getProductsByCategory: async (maloai, page = 1, limit = 12) => {
    try {
      const response = await api.get(`/products/category/${maloai}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductsByCategory:", error);
      throw error.response?.data || { message: "Lỗi tải sản phẩm theo danh mục!" };
    }
  },
  
  // ✅ Tìm kiếm sản phẩm có phân trang
  searchProducts: async (filters) => {
    try {
      const response = await api.get('/products/search', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi searchProducts:", error);
      throw error.response?.data || { message: "Lỗi tìm kiếm sản phẩm!" };
    }
  },
  
  // ✅ Lấy sản phẩm HOT (bán chạy) - giới hạn số lượng
  getHotProducts: async (limit = 8) => {
    try {
      const response = await api.get('/products/hot', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getHotProducts:", error);
      throw error.response?.data || { message: "Lỗi tải sản phẩm hot!" };
    }
  },
  
  // ✅ Lấy sản phẩm mới nhất - giới hạn số lượng
  getLatestProducts: async (limit = 8) => {
    try {
      const response = await api.get('/products/latest', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getLatestProducts:", error);
      throw error.response?.data || { message: "Lỗi tải sản phẩm mới!" };
    }
  },
  
  // ✅ Lấy chi tiết 1 sản phẩm
  getProductById: async (masp) => {
    try {
      const response = await api.get(`/products/${masp}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductById:", error);
      throw error.response?.data || { message: "Lỗi tải chi tiết sản phẩm!" };
    }
  },
  
  // ⚠️ Lấy TOÀN BỘ sản phẩm (KHÔNG NÊN DÙNG cho trang chủ - chỉ dùng cho admin)
  // Nếu vẫn cần, phải tạo endpoint riêng: /products/all
  getAllProducts: async () => {
    try {
      // ⚠️ CẢNH BÁO: Endpoint này sẽ tải TẤT CẢ sản phẩm - chỉ dùng cho admin
      const response = await api.get("/products/all");
      return response.data;
    } catch (error) {
      console.error("Lỗi getAllProducts:", error);
      throw error.response?.data || { message: "Lỗi tải toàn bộ sản phẩm!" };
    }
  }
};

export default productService;