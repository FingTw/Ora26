const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/authMiddleware");

// ✅ SẮP XẾP LẠI ROUTES (route cụ thể trước, route tham số sau)
router.post("/add", verifyToken, cartController.addToCart);
router.put("/update", verifyToken, cartController.updateCartItem);
router.get("/count", verifyToken, cartController.getCartCount);
router.get("/", verifyToken, cartController.getCart); // ✅ Đã sửa: bỏ /:matk

module.exports = router;