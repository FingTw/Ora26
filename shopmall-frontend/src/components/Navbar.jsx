import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import SearchBar from "../components/SearchBar";  // ✅ Thêm import SearchBar

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 2. HÚT CON SỐ cartCount REAL-TIME TỪ KHO RA
  const { cartCount } = useContext(CartContext);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString && userString !== "undefined") {
      try {
        setUser(JSON.parse(userString));
      } catch (error) {
        console.error("Lỗi đọc thông tin user:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // Tải lại trang để xóa sạch giỏ hàng cũ trên màn hình
    window.location.href = "/login";
  };

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold tracking-wider">
            🌿 ShopMall
          </Link>

          {/* ✅ Thêm SearchBar vào giữa logo và các menu */}
          <div className="flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200 transition">
              Trang chủ
            </Link>

            {/* 3. HIỂN THỊ CON SỐ THẬT Ở ĐÂY */}
            <Link
              to="/cart"
              className="hover:text-green-200 transition relative"
            >
              Giỏ hàng
              <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium text-green-100 bg-green-700 px-3 py-1.5 rounded-full">
                  👋 Chào, {user.HOTEN}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-red-500 text-white px-3 py-1.5 rounded-md font-medium transition text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-green-50 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;