import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import { CartContext } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const { fetchCartCount } = useContext(CartContext);

  const imageUrl =
    product.HINHANH && product.HINHANH !== "default.jpg"
      ? `http://localhost:5000/uploads/${product.HINHANH}`
      : "https://via.placeholder.com/300x200?text=Chua+co+anh";

  // Hàm xử lý khi khách bấm nút "Thêm vào giỏ"
  const handleAddToCart = async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      alert("🌿 Bạn cần đăng nhập để mua nông sản nhé!");
      navigate("/login");
      return;
    }

    try {
      const res = await cartService.addToCart({
        masp: product.MASP,
        soluong: 1,
      });

      if (res.success) {
        alert(`Đã thêm ${product.TENSP} vào giỏ hàng! 🛒`);
        await fetchCartCount();
      }
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra khi thêm vào giỏ!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <img
        src={imageUrl}
        alt={product.TENSP}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-800 truncate"
          title={product.TENSP}
        >
          {product.TENSP}
        </h3>
        <p
          className="text-sm text-gray-500 mt-1 line-clamp-2"
          title={product.MOTA}
        >
          {product.MOTA}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-green-600 font-bold text-xl">
            {product.DONGIA?.toLocaleString()} đ
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-green-100 text-green-700 px-3 py-2 rounded-md font-medium hover:bg-green-600 hover:text-white transition-colors duration-300 text-sm active:scale-95"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
