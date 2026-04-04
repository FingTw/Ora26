import { useState, useEffect } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect sẽ tự động chạy 1 lần duy nhất khi mở trang này
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        if (res.success) {
          // Lưu mảng sản phẩm lấy từ Oracle vào State
          setProducts(res.data);
        }
      } catch (err) {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
        console.error("Lỗi tải trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-green-600 animate-pulse">
          🌿 Đang thu hoạch nông sản...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="bg-green-600 text-white rounded-xl p-8 mb-8 shadow-lg text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Nông Sản Sạch - Trực tiếp từ nhà vườn
        </h1>
        <p className="text-green-100 text-lg">
          Mua sắm an toàn, ủng hộ nông dân Việt Nam
        </p>
      </div>

      {/* Danh sách sản phẩm dạng Lưới (Grid) */}
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-3">
          Sản phẩm mới nhất
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          Hiện chưa có sản phẩm nào được đăng bán. Bạn hãy đăng nhập và mở cửa
          hàng nhé!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.MASP} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
