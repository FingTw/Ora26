import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      setCategories(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      await adminService.addCategory({ tenloai: newCat });
      setNewCat("");
      fetchData();
    } catch (err) { alert(err.message || "Lỗi thêm danh mục"); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      fetchData();
    } catch (err) { alert("Xóa thất bại: đang có sản phẩm thuộc danh mục này."); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      await adminService.updateCategory(editingId, { tenloai: editingName });
      setEditingId(null);
      setEditingName("");
      fetchData();
    } catch (err) { alert(err.message || "Lỗi cập nhật"); }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Quản lý Danh mục</h2>
        <p className="text-sm text-gray-500">{categories.length} danh mục sản phẩm</p>
      </div>

      {/* Form thêm mới */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          placeholder="Nhập tên danh mục mới..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Thêm mới
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Đang tải...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-20">Mã</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên danh mục</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.MALOAI} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.MALOAI}</td>
                  <td className="px-4 py-3">
                    {editingId === cat.MALOAI ? (
                      <form onSubmit={handleUpdate} className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="flex-1 border border-indigo-300 rounded px-2.5 py-1.5 text-sm focus:outline-none"
                          autoFocus
                        />
                        <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700">Lưu</button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300">Hủy</button>
                      </form>
                    ) : (
                      <span className="text-gray-800 font-medium">{cat.TENLOAI}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    {editingId !== cat.MALOAI && (
                      <>
                        <button
                          onClick={() => { setEditingId(cat.MALOAI); setEditingName(cat.TENLOAI); }}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cat.MALOAI, cat.TENLOAI)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-400">Chưa có danh mục nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
