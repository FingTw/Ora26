import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminDashboard = () => {
  const [db, setDb] = useState({});

  useEffect(() => {
    adminService.getDashboard().then(res => setDb(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Thống Kê Tổng Quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-lg">Tổng Tài Khoản</h3>
          <p className="text-3xl font-bold text-gray-800">{db.TONG_TAIKHOAN || 0}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-lg">Tổng Cửa Hàng</h3>
          <p className="text-3xl font-bold text-gray-800">{db.TONG_CUAHANG || 0}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-lg">Tổng Đơn Hàng</h3>
          <p className="text-3xl font-bold text-gray-800">{db.TONG_HOADON || 0}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-lg">Tổng Sản Phẩm</h3>
          <p className="text-3xl font-bold text-gray-800">{db.TONG_SANPHAM || 0}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-gray-500 text-lg">Tổng Doanh Thu H.Thống</h3>
          <p className="text-3xl font-bold text-gray-800">{db.DOANHTHU_HETHONG?.toLocaleString() || 0} đ</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
