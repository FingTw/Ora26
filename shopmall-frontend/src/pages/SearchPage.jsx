// src/pages/SearchPage.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import productService from "../services/productService";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Lấy params từ URL
  const keyword  = searchParams.get("keyword")  || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort     = searchParams.get("sort")     || "moi_nhat";
  const page     = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    fetchSearch();
  }, [searchParams]); // Chạy lại mỗi khi URL thay đổi

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const result = await productService.searchProducts({
        keyword:  keyword  || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        page,
        limit: pagination.pageSize
      });

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    // Cập nhật page trong URL, giữ nguyên các params khác
    setSearchParams(prev => {
      prev.set("page", newPage);
      return prev;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header kết quả */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "Tìm kiếm sản phẩm"}
        </h1>
        {pagination.totalItems > 0 && (
          <p className="text-gray-500 mt-1">
            Tìm thấy {pagination.totalItems} sản phẩm
          </p>
        )}
      </div>

      {/* Bộ lọc sắp xếp */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { value: "moi_nhat", label: "Mới nhất" },
          { value: "gia_tang", label: "Giá tăng dần" },
          { value: "gia_giam", label: "Giá giảm dần" },
          { value: "ten_az",   label: "Tên A→Z" },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setSearchParams(prev => {
              prev.set("sort", option.value);
              prev.set("page", 1);
              return prev;
            })}
            className={`px-4 py-2 rounded-lg border text-sm transition ${
              sort === option.value
                ? "bg-green-600 text-white border-green-600"
                : "hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-green-600">Đang tìm kiếm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg text-gray-600">
            Không tìm thấy sản phẩm nào {keyword && `cho "${keyword}"`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.MASP} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />

          <div className="text-center text-sm text-gray-500 mt-4">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;