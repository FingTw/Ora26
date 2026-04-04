import api from "./api";

const adminService = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get("/admin/orders");
    return response.data;
  },
  getShops: async () => {
    const response = await api.get("/admin/shops");
    return response.data;
  },
  updateShop: async (id, data) => {
    const response = await api.put(`/admin/shops/${id}`, data);
    return response.data;
  },
  deleteShop: async (id) => {
    const response = await api.delete(`/admin/shops/${id}`);
    return response.data;
  },
  // CRUD Danh mục (Loại Sản Phẩm)
  getCategories: async () => {
    const response = await api.get("/admin/categories");
    return response.data;
  },
  addCategory: async (data) => {
    const response = await api.post("/admin/categories", data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  }
};

export default adminService;
