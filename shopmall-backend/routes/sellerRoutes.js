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

module.exports = router;
