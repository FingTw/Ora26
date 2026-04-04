import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminShops = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await adminService.getShops();
      setShops(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (shop) => {
    const newStatus = shop.TRANGTHAI === "HOẠT ĐỘNG" ? "BỊ KHÓA" : "HOẠT ĐỘNG";
    if (window.confirm(`Xác nhận chuyển cửa hàng sang trạng thái: ${newStatus}?`)) {
      try {
        await adminService.updateShop(shop.MACH, { trangthai: newStatus });
        fetchShops();
      } catch (err) {
        alert(err.message || "Lỗi cập nhật");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("CẨN THẬN: Xóa cửa hàng có thể lỗi nếu họ đang có SP/Đơn hàng. Bạn chắn chắn chứ?")) {
      try {
        await adminService.deleteShop(id);
        fetchShops();
      } catch (err) {
        alert(err.message || "Xóa thất bại (vướng khóa ngoại)!");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản Lý Cửa Hàng (Gian Hàng)</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Mã CH</th>
              <th className="p-3 border">Tên Cửa Hàng</th>
              <th className="p-3 border">Thông Tin Chủ (Email)</th>
              <th className="p-3 border">Địa Chỉ</th>
              <th className="p-3 border text-center">Trạng Thái</th>
              <th className="p-3 border text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop, i) => (
              <tr key={i} className="hover:bg-gray-50 border-b">
                <td className="p-3 border font-semibold">{shop.MACH}</td>
                <td className="p-3 border text-blue-700 font-medium">{shop.TENCH}</td>
                <td className="p-3 border">
                  {shop.TENCHUCUAHANG} <br/>
                  <span className="text-sm text-gray-500">{shop.EMAIL}</span>
                </td>
                <td className="p-3 border text-sm text-gray-600">{shop.DIACHI}</td>
                <td className="p-3 border text-center">
                  <span className={`px-2 py-1 rounded text-sm text-white ${shop.TRANGTHAI === 'HOẠT ĐỘNG' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {shop.TRANGTHAI}
                  </span>
                </td>
                <td className="p-3 border text-center whitespace-nowrap">
                  <button 
                    onClick={() => handleToggleStatus(shop)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2 text-sm"
                  >
                    {shop.TRANGTHAI === 'HOẠT ĐỘNG' ? 'Khóa' : 'Mở Khóa'}
                  </button>
                  <button 
                    onClick={() => handleDelete(shop.MACH)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">Chưa có cửa hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShops;
