const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const verifyToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Cất vào thư mục uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post("/open-store", verifyToken, sellerController.openStore); // Mở cửa hàng
router.post(
  "/products",
  verifyToken,
  upload.single("hinhanh"),
  sellerController.addProduct,
);
router.get("/orders/:matk", verifyToken, sellerController.getShopOrders); // Xem đơn khách đặt
router.put("/orders/status", verifyToken, sellerController.updateOrderStatus); // Cập nhật trạng thái đơn
router.get("/shop-info/:matk", verifyToken, sellerController.getShopInfo); // Lấy thông tin shop của tài khoản

// -- Route quản lý sản phẩm
router.get("/products/myshop/:matk", verifyToken, sellerController.getShopProducts); // Lấy sp của shop
router.put("/products/:id", verifyToken, upload.single("hinhanh"), sellerController.updateProduct); // Sửa sp
router.delete("/products/:id", verifyToken, sellerController.deleteProduct); // Xoá sp

module.exports = router;
