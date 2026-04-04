import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import { CartContext } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);

  // ✅ Xử lý ảnh tốt hơn
  const imageUrl = (() => {
    if (product.HINHANH && product.HINHANH !== "default.jpg" && product.HINHANH !== "null") {
      return `http://localhost:5000/uploads/${product.HINHANH}`;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  })();

  // Hàm xử lý khi khách bấm nút "Thêm vào giỏ"
  const handleAddToCart = async () => {
    const userString = localStorage.getItem("user");
    if (!userString || userString === "undefined") {
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
        alert(`✅ Đã thêm ${product.TENSP} vào giỏ hàng! 🛒`);
        await fetchCartCount();
      }
    } catch (error) {
      const errorMsg = error.message || error.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ!";
      alert(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.TENSP}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        {/* Badge mới */}
        {product.SOLUONGTON < 10 && product.SOLUONGTON > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Sắp hết hàng
          </span>
        )}
        {product.SOLUONGTON === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Hết hàng
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-800 truncate"
          title={product.TENSP}
        >
          {product.TENSP}
        </h3>
        
        {product.MOTA && (
          <p
            className="text-sm text-gray-500 mt-1 line-clamp-2 h-10"
            title={product.MOTA}
          >
            {product.MOTA.length > 60 ? product.MOTA.substring(0, 60) + '...' : product.MOTA}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-green-600 font-bold text-xl">
              {product.DONGIA?.toLocaleString()}đ
            </span>
            {product.SOLUONGTON > 0 && (
              <p className="text-xs text-gray-400 mt-1">Còn {product.SOLUONGTON} sp</p>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.SOLUONGTON === 0}
            className={`px-3 py-2 rounded-md font-medium transition-all duration-300 text-sm active:scale-95 ${
              product.SOLUONGTON === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white'
            }`}
          >
            {product.SOLUONGTON === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;