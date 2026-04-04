import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert(err.message || "Xóa thất bại / Vướng dữ liệu");
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Quản Lý Tài Khoản</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Họ Tên</th>
              <th className="p-3 border-b">SĐT</th>
              <th className="p-3 border-b">Vai Trò</th>
              <th className="p-3 border-b text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50 border-b">
                <td className="p-3">{u.MATK}</td>
                <td className="p-3">{u.EMAIL}</td>
                <td className="p-3">{u.HOTEN}</td>
                <td className="p-3">{u.SDT}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${u.MAVAITRO === 1 ? 'bg-red-100 text-red-700' : u.MAVAITRO === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.TENVAITRO}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {u.MAVAITRO !== 1 && (
                    <button 
                      onClick={() => handleDelete(u.MATK)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
