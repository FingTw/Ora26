const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyAdminToken = require("../middlewares/adminMiddleware");

// Apply middleware for ALL admin routes
router.use(verifyAdminToken);

// Lấy danh sách thống kê tổng quan
router.get("/dashboard", adminController.getDashboard);

// Quản lý Tài Khoản
router.get("/users", adminController.getUsers);
router.post("/users", adminController.addUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Quản lý Loại Sản Phẩm (Danh mục)
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.addCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Quản lý Cửa Hàng
router.get("/shops", adminController.getShops);
router.put("/shops/:id", adminController.updateShop);
router.delete("/shops/:id", adminController.deleteShop);

// Quản lý Đơn Hàng
router.get("/orders", adminController.getOrders);

// Biểu đồ phân tích
router.get("/chart-data", adminController.getChartData);

module.exports = router;
