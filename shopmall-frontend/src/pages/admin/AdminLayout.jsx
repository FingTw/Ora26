import { Outlet, NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/users", label: "👥 Tài khoản" },
  { to: "/admin/shops", label: "🏪 Cửa hàng" },
  { to: "/admin/categories", label: "📑 Danh mục" },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 text-sm">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">ShopMall</p>
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-md font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={() => { localStorage.removeItem("user"); window.location.href = "/"; }}
            className="w-full text-left px-3 py-2.5 rounded-md text-gray-400 hover:bg-red-700 hover:text-white transition-colors font-medium"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
