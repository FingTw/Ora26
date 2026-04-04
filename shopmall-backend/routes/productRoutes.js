const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/categories", productController.getCategories);
router.get("/search", productController.searchProducts);
router.get("/", productController.getProductsPaginated);
router.get("/category/:maloai", productController.getProductsByCategory);

module.exports = router;
