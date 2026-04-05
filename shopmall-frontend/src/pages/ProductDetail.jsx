import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import { CartContext } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || 'Không thể lấy thông tin sản phẩm.');
        }
      } catch (err) {
        setError('Lỗi kết nối tới máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

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
        soluong: quantity,
      });

      if (res.success) {
        alert(`✅ Đã thêm ${quantity} x ${product.TENSP} vào giỏ hàng! 🛒`);
        await fetchCartCount();
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ!";
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'dec' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'inc' && product && quantity < product.SOLUONGTON) {
      setQuantity(quantity + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy sản phẩm!'}</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          &larr; Về trang chủ
        </button>
      </div>
    );
  }

  const imageUrl = product.HINHANH && product.HINHANH !== "default.jpg" && product.HINHANH !== "null"
    ? `http://localhost:5000/uploads/${product.HINHANH}`
    : "https://via.placeholder.com/600x400?text=No+Image";

  const isOutOfStock = product.SOLUONGTON === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb / Navigation */}
      <nav className="mb-6 text-sm text-gray-500 font-medium flex items-center gap-2">
        <button onClick={() => navigate('/')} className="hover:text-green-600">Trang chủ</button>
        <span>/</span>
        <button className="hover:text-green-600 cursor-default">{product.TENLOAI}</button>
        <span>/</span>
        <span className="text-gray-800">{product.TENSP}</span>
      </nav>

      {/* Product Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
        
        {/* L: Ảnh SP */}
        <div className="w-full md:w-1/2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square shadow-inner">
            <img 
              src={imageUrl} 
              alt={product.TENSP} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                Đã Hết Hàng
              </div>
            )}
          </div>
        </div>

        {/* R: Thông tin chi tiết */}
        <div className="w-full md:w-1/2 flex flex-col">
          
          {/* Tag & Thương hiệu */}
          <div className="flex items-center justify-between mb-2">
            <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-semibold tracking-wide border border-teal-200">
              {product.TENLOAI}
            </span>
            <div className="flex gap-1 text-yellow-400">
               {/* 5 ngôi sao */}
               {[1,2,3,4,5].map(star => (
                 <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                 </svg>
               ))}
               <span className="text-gray-400 text-sm ml-1">(150 đánh giá)</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-4">
            {product.TENSP}
          </h1>

          {/* Cửa hàng */}
          <div className="flex items-center gap-2 mb-6 bg-gray-50 w-fit px-4 py-2 rounded-xl">
             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                {product.TENCH.charAt(0)}
             </div>
             <div>
               <p className="text-xs text-gray-500 font-medium">Bán bởi cửa hàng</p>
               <p className="text-sm font-bold text-gray-700">{product.TENCH}</p>
             </div>
          </div>

          {/* Giá */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">Giá sản phẩm</span>
            <span className="text-4xl text-green-600 font-extrabold tracking-tight">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.DONGIA)}
            </span>
          </div>

          {/* Mô tả */}
          <div className="mb-8 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Chi tiết sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.MOTA || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
            </p>
          </div>

          {/* Khối Đặt hàng */}
          <div className="mt-auto border-t pt-6 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            
            {/* Hộp chọn Số lượng */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Số lượng cẩn mua</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12 w-36">
                <button 
                  onClick={() => handleQuantityChange('dec')}
                  disabled={isOutOfStock}
                  className="w-10 h-full flex items-center justify-center text-xl font-medium hover:bg-gray-100 active:bg-gray-200 text-gray-600 disabled:opacity-50 transition"
                >
                  -
                </button>
                <input 
                  type="text" 
                  readOnly 
                  value={quantity}
                  className="w-16 h-full text-center font-bold text-lg text-gray-800 outline-none"
                />
                <button 
                  onClick={() => handleQuantityChange('inc')}
                  disabled={isOutOfStock}
                  className="w-10 h-full flex items-center justify-center text-xl font-medium hover:bg-gray-100 active:bg-gray-200 text-gray-600 disabled:opacity-50 transition"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium px-1">Kho: {product.SOLUONGTON} có sẵn</span>
            </div>

            {/* Nút Đặt mua lớn */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-14 rounded-2xl shadow-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 ${
                isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 text-white border-green-600 hover:bg-white hover:text-green-600'
              }`}
            >
              {isOutOfStock ? 'SẢN PHẨM HẾT HÀNG' : 'THÊM VÀO GIỎ MUA'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
