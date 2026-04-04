const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/authMiddleware");

// Đăng ký các API giỏ hàng
router.post("/add", verifyToken, cartController.addToCart);
router.put("/update", verifyToken, cartController.updateCartItem);
router.get("/count", verifyToken, cartController.getCartCount);
router.get("/:matk", verifyToken, cartController.getCart);

module.exports = router;
