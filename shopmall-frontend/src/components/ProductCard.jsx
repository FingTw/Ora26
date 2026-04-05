import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import cartService from "../services/cartService";
import { CartContext } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);

  const imageUrl = (() => {
    if (product.HINHANH && product.HINHANH !== "default.jpg" && product.HINHANH !== "null") {
      return `http://localhost:5000/uploads/${product.HINHANH}`;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  })();

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

  const isOutOfStock = product.SOLUONGTON === 0;

  return (
    <div className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden">

      {/* 🖼 KHUNG HÌNH ẢNH */}
      <Link to={`/product/${product.MASP}`} className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-50 block">
        <img
          src={imageUrl}
          alt={product.TENSP}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />

        {/* Badge Trạng thái Góc Trái */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${isOutOfStock ? 'bg-green-600' : 'bg-green-500'}`}>
            {isOutOfStock ? 'Hết hàng' : 'Đang bán'}
          </span>
        </div>

        {/* Nút thả tim yêu thích Góc Phải */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add logic later */ }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 p-2 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>

        {/* Badge Số lượng Tồn Áng Ngự Dưới Phải */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-3 py-2 rounded-full text-xs font-bold text-white shadow max-w-[150px] truncate block ${isOutOfStock ? 'bg-gray-500' : 'bg-blue-500'}`}>
            Còn {product.SOLUONGTON} sản phẩm
          </span>
        </div>
      </Link>

      {/* 📃 NỘI DUNG CARD */}
      <div className="p-4 flex flex-col flex-1">

        {/* Tên sản phẩm */}
        <Link to={`/product/${product.MASP}`} className="hover:text-green-600 transition-colors block">
          <h3 className="text-base font-bold text-gray-800 truncate" title={product.TENSP}>
            {product.TENSP}
          </h3>
        </Link>

        {/* Đánh giá (Giả lập Số Sao) */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-gray-300 text-xs">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          </div>
          <span className="text-xs text-gray-400"></span>
        </div>

        {/* Tên gian hàng */}
        {product.TENCH && (
          <div className="flex items-center gap-1 mt-2 text-gray-500 text-[16px] font-medium tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            <span className="truncate">{product.TENCH}</span>
          </div>
        )}

        {/* Mô tả ngắn */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-1" title={product.MOTA}>
          {product.MOTA || 'Tuyệt đỉnh chuẩn vị nông thôn sạch.'}
        </p>

        {/* Tag Phân Loại SP */}
        <div className="mt-2 text-left">
          <span className="inline-block border border-teal-500 text-teal-600 rounded-full px-2.5 py-0.5 text-[13px] font-medium tracking-wide bg-teal-50/50 truncate max-w-full">
            {product.TENLOAI || 'Đặt sản'}
          </span>
        </div>

        {/* Vùng dưới cùng: Giá + Nút giỏ hàng */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-green-500 font-extrabold text-xl tracking-tight">
            {product.DONGIA?.toLocaleString()} đ
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-14 h-9 flex items-center justify-center rounded-xl shadow-sm transition-all duration-300 active:scale-90 ${isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
              }`}
            title="Thêm vào giỏ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;