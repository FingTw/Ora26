import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminService.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      await adminService.addCategory({ tenloai: newCat });
      setNewCat("");
      fetchData();
      alert("Thêm danh mục thành công!");
    } catch (err) {
      alert(err.message || "Lỗi thêm danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await adminService.deleteCategory(id);
        fetchData();
      } catch (err) {
        alert(err.message || "Lỗi xóa danh mục (Bị vướng khóa ngoại do đang có sản phẩm thuộc loại này)!");
      }
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.MALOAI);
    setEditingName(cat.TENLOAI);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateCategory(editingId, { tenloai: editingName });
      setEditingId(null);
      setEditingName("");
      fetchData();
      alert("Cập nhật thành công!");
    } catch (err) {
      alert(err.message || "Lỗi cập nhật");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Loại Sản Phẩm (Danh Mục)</h2>
      
      {/* Khung Thêm mới */}
      <form onSubmit={handleAdd} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={newCat} 
          onChange={(e) => setNewCat(e.target.value)} 
          placeholder="Nhập tên danh mục mới..." 
          className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition">
          Thêm Mới
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Mã Loại</th>
              <th className="p-3 border">Tên Loại Sản Phẩm</th>
              <th className="p-3 border text-center w-48">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={i} className="hover:bg-gray-50 border-b">
                <td className="p-3 border font-semibold text-gray-600">{cat.MALOAI}</td>
                <td className="p-3 border">
                  {editingId === cat.MALOAI ? (
                    <form onSubmit={handleUpdate} className="flex gap-2">
                       <input 
                          type="text" 
                          value={editingName} 
                          onChange={(e) => setEditingName(e.target.value)} 
                          className="flex-1 border px-2 py-1 rounded"
                          autoFocus
                       />
                       <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Lưu</button>
                       <button type="button" onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500">Hủy</button>
                    </form>
                  ) : (
                    <span className="text-gray-800">{cat.TENLOAI}</span>
                  )}
                </td>
                <td className="p-3 border text-center">
                   {editingId !== cat.MALOAI && (
                     <>
                        <button 
                          onClick={() => startEdit(cat)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.MALOAI)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
                <td colSpan="3" className="p-6 text-center text-gray-500">Chưa có danh mục nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
