// src/services/authService.js
import api from "./api";

const authService = {
  // Hàm gọi API Đăng ký
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server!" };
    }
  },

  // Hàm gọi API Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server!" };
    }
  },
};

export default authService;
