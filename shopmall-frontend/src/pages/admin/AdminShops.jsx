import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShops(); }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await adminService.getShops();
      setShops(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async (shop) => {
    const newStatus = shop.TRANGTHAI === "HOẠT ĐỘNG" ? "BỊ KHÓA" : "HOẠT ĐỘNG";
    if (!window.confirm(`Chuyển cửa hàng "${shop.TENCH}" sang trạng thái: ${newStatus}?`)) return;
    try {
      await adminService.updateShop(shop.MACH, { trangthai: newStatus });
      fetchShops();
    } catch (err) { alert(err.message || "Lỗi cập nhật"); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa cửa hàng "${name}"? Chỉ xóa được nếu không còn sản phẩm/đơn hàng.`)) return;
    try {
      await adminService.deleteShop(id);
      fetchShops();
    } catch (err) { alert("Xóa thất bại: " + (err.message || "Vướng khóa ngoại")); }
  };

  const filtered = shops.filter(s =>
    s.TENCH?.toLowerCase().includes(search.toLowerCase()) ||
    s.EMAIL?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Cửa hàng</h2>
          <p className="text-sm text-gray-500">{shops.length} cửa hàng trong hệ thống</p>
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên / email chủ..."
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Mã</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên cửa hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Chủ cửa hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Địa chỉ</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((shop) => (
                  <tr key={shop.MACH} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{shop.MACH}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{shop.TENCH}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{shop.TENCHUCUAHANG}</p>
                      <p className="text-xs text-gray-500">{shop.EMAIL}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={shop.DIACHI}>{shop.DIACHI}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        shop.TRANGTHAI === "HOẠT ĐỘNG" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {shop.TRANGTHAI}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleToggleStatus(shop)}
                        className={`px-3 py-1.5 text-xs font-semibold border rounded transition-colors ${
                          shop.TRANGTHAI === "HOẠT ĐỘNG"
                            ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                        }`}
                      >
                        {shop.TRANGTHAI === "HOẠT ĐỘNG" ? "Khóa" : "Mở khóa"}
                      </button>
                      <button
                        onClick={() => handleDelete(shop.MACH, shop.TENCH)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">Không tìm thấy cửa hàng nào.</td>
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

export default AdminShops;
