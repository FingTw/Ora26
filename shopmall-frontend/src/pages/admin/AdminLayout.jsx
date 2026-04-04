import { Outlet, Link, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold bg-gray-900 text-center">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block p-2 hover:bg-gray-700 rounded transition duration-200">
            📊 Dashboard
          </Link>
          <Link to="/admin/categories" className="block p-2 hover:bg-gray-700 rounded transition duration-200">
            📑 Danh mục
          </Link>
          <Link to="/admin/users" className="block p-2 hover:bg-gray-700 rounded transition duration-200">
            👥 Tài khoản
          </Link>
          <Link to="/admin/shops" className="block p-2 hover:bg-gray-700 rounded transition duration-200">
            🏪 Cửa hàng
          </Link>
          <Link to="/admin/orders" className="block p-2 hover:bg-gray-700 rounded transition duration-200">
            📦 Đơn hàng
          </Link>
        </nav>
        <div className="p-4">
          <button 
            onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }} 
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-white"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
