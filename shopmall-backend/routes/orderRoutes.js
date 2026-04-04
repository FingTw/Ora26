const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/checkout", verifyToken, orderController.checkout);
router.post("/cancel", verifyToken, orderController.cancelOrder);
router.get("/history/:matk", verifyToken, orderController.getHistory);
router.get("/details/:mahd", verifyToken, orderController.getOrderDetails);

module.exports = router;
