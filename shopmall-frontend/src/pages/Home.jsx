// shopmall-frontend/src/pages/Home.jsx
import { useState, useEffect } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  });

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("📡 Gọi API getProducts với page:", page);
      const res = await productService.getProducts(page, pagination.pageSize);
      console.log("📦 Response từ API:", res);
      
      // ✅ Kiểm tra cấu trúc response
      if (res && res.success === true) {
        // ✅ Đảm bảo data là mảng
        const productsData = Array.isArray(res.data) ? res.data : [];
        setProducts(productsData);
        
        // ✅ Xử lý pagination an toàn
        if (res.pagination) {
          setPagination({
            currentPage: res.pagination.currentPage || page,
            pageSize: res.pagination.pageSize || pagination.pageSize,
            totalItems: res.pagination.totalItems || 0,
            totalPages: res.pagination.totalPages || 0
          });
        } else {
          // Nếu không có pagination từ API, tự tính
          setPagination(prev => ({
            ...prev,
            currentPage: page,
            totalItems: productsData.length,
            totalPages: 1
          }));
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error("API trả về success=false hoặc cấu trúc sai:", res);
        setError(res?.message || "Không thể tải sản phẩm!");
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Lỗi chi tiết:", err);
      setError(err.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchProducts(1);
  }, []); // Chỉ chạy 1 lần khi mount

  // ✅ Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchProducts(newPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-xl font-semibold text-green-600 animate-pulse">
          🌿 Đang thu hoạch nông sản...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
        <button 
          onClick={() => fetchProducts(1)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full h-[300px] mb-8 rounded-3xl overflow-hidden shadow-2xl group">
        <img 
          src="/BANNER-WEB-NONG-NGHIEP-VINASA.jpg" 
          alt="Banner Nông Sản" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <div className="px-8 md:px-16 text-white max-w-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg leading-tight tracking-tight">
              Nông Sản Sạch <br/><span className="text-green-400">Từ Nông Trại Việt</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-6 drop-shadow-md opacity-90">
              Chung tay kết nối nhà nông, mang sản phẩm an toàn, chất lượng nhất đến mọi gia đình.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 text-lg px-8 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(22,163,74,0.7)]"
            >
              Mua Sắm Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Header với thông tin phân trang */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-end gap-4">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-3">
          Sản phẩm mới nhất
        </h2>
        
        {pagination.totalItems > 0 && (
          <div className="text-sm text-gray-500">
            Hiển thị {products.length} / {pagination.totalItems} sản phẩm
          </div>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-lg">Hiện chưa có sản phẩm nào được đăng bán.</p>
          <p className="text-sm mt-2">Bạn hãy đăng nhập và mở cửa hàng nhé!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.MASP} product={product} />
            ))}
          </div>
          
          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2 flex-wrap justify-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  ⏮ Đầu
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  ◀ Trước
                </button>
                
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg transition ${
                      pagination.currentPage === page
                        ? 'bg-green-600 text-white border-green-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  Sau ▶
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  Cuối ⏭
                </button>
              </div>
            </div>
          )}
          
          {pagination.totalPages > 1 && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;