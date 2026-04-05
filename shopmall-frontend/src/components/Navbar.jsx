import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import SearchBar from "../components/SearchBar";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <nav className="bg-white text-black shadow-md rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Nông Sản Logo" className="h-10 w-auto group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-extrabold tracking-wider text-green-700">Mall</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200 transition">
              Trang chủ
            </Link>

            <SearchBar />

            {/* 3. HIỂN THỊ CON SỐ THẬT Ở ĐÂY */}
            <Link
              to="/cart"
              className="text-gray-600 hover:text-green-200 transition relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div 
                    className="font-medium text-green-100 bg-green-600 px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1 hover:bg-green-700 transition"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    👋 Chào, {user.HOTEN}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                      {user.MAVAITRO === 3 ? (
                        <Link
                          to="/shop/management"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Quản lý cửa hàng
                        </Link>
                      ) : (
                        <Link
                          to="/shop/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Đăng ký bán hàng
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <Link
                        to="/user/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        📦 Đơn hàng của tôi
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gray-300 hover:bg-red-500 hover:text-white text-black px-3 py-1.5 rounded-md font-medium transition text-sm"
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
