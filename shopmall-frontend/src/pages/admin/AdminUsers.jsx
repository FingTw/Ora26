import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const ROLE_LABELS = { 1: "Admin", 2: "Khách hàng", 3: "Người bán" };
const ROLE_COLORS = {
  1: "bg-red-100 text-red-700",
  2: "bg-gray-100 text-gray-700",
  3: "bg-blue-100 text-blue-700"
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tài khoản này? Thao tác không thể hoàn tác.")) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.message || "Xóa thất bại (vướng dữ liệu liên quan)");
    }
  };

  const filtered = users.filter(u =>
    u.EMAIL?.toLowerCase().includes(search.toLowerCase()) ||
    u.HOTEN?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Tài khoản</h2>
          <p className="text-sm text-gray-500">{users.length} tài khoản trong hệ thống</p>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm email / họ tên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 w-64"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Họ tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">SĐT</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Vai trò</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.MATK} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{u.MATK}</td>
                    <td className="px-4 py-3 text-gray-800">{u.EMAIL}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.HOTEN}</td>
                    <td className="px-4 py-3 text-gray-600">{u.SDT || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.MAVAITRO] || "bg-gray-100 text-gray-600"}`}>
                        {u.TENVAITRO}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.MAVAITRO !== 1 ? (
                        <button
                          onClick={() => handleDelete(u.MATK)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">Không tìm thấy tài khoản nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
