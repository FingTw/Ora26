// shopmall-frontend/src/pages/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import productService from "../services/productService";

const CategoryPage = () => {
  const { maloai } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  });
  
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [maloai]);
  
  useEffect(() => {
    fetchProductsByCategory();
  }, [maloai, pagination.currentPage]);
  
  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      const result = await productService.getProductsByCategory(
        maloai,
        pagination.currentPage,
        pagination.pageSize
      );
      
      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Danh mục sản phẩm</h1>
      
      {loading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map(product => (
              <ProductCard key={product.MASP} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          />
        </>
      ) : (
        <div className="text-center py-12">Không tìm thấy sản phẩm</div>
      )}
    </div>
  );
};

export default CategoryPage; 