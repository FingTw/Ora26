import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const fetchHistory = async (userInfo) => {
    try {
      setLoading(true);
      const res = await orderService.getHistory(userInfo.MATK);
      if (res.success) {
        setOrders(res.data);
      } else {
        setError("Không thể tải lịch sử đơn hàng");
      }
    } catch (err) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString || userString === "undefined") {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userString);
    setUser(parsedUser);
    fetchHistory(parsedUser);
  }, [navigate]);

  const handleCancelOrder = async (mahd) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không? Việc này không thể hoàn tác.")) {
      return;
    }
    try {
      const res = await orderService.cancelOrder(mahd, user.MATK);
      if (res.success) {
        alert("Đã hủy đơn hàng thành công!");
        fetchHistory(user); // Tải lại danh sách
      } else {
        alert("Lỗi: " + res.message);
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message || "Không thể hủy đơn."));
    }
  };

  const handleReceiveOrder = async (mahd) => {
    if (!window.confirm("Bạn xác nhận đã nhận được hàng và hàng còn nguyên vẹn chứ?")) {
      return;
    }
    try {
      const res = await orderService.receiveOrder(mahd, user.MATK);
      if (res.success) {
        alert("🎉 Cảm ơn bạn đã xác nhận nhận hàng!");
        fetchHistory(user); // Tải lại danh sách
      } else {
        alert("Lỗi: " + res.message);
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message || "Không thể xác nhận."));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải lịch sử mua hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2 border-l-4 border-green-500 pl-4 tracking-tight">
        Đơn Hàng Của Tôi
      </h1>
      <p className="text-gray-500 mb-8 ml-5 tracking-wide">Quản lý và theo dõi trạng thái các đơn hàng bạn đã mua</p>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          ⚠️ {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
          <div className="text-7xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những nông sản tươi sạch nhé!</p>
          <button onClick={() => navigate("/")} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 transition">
            Khám phá trạm Nông Sản
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isCancellable = order.TRANGTHAI === 'CHỜ XÁC NHẬN';
            const isReceivable = order.TRANGTHAI === 'ĐANG GIAO';

            let statusColor = "bg-gray-100 text-gray-600";
            if (order.TRANGTHAI === 'CHỜ XÁC NHẬN') statusColor = "bg-orange-100 text-orange-600 border-orange-200";
            if (order.TRANGTHAI === 'ĐANG XỬ LÝ') statusColor = "bg-blue-100 text-blue-600 border-blue-200";
            if (order.TRANGTHAI === 'HOÀN THÀNH') statusColor = "bg-green-100 text-green-600 border-green-200";
            if (order.TRANGTHAI === 'ĐÃ HỦY') statusColor = "bg-red-100 text-red-600 border-red-200";

            return (
              <div key={order.MAHD} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                {/* Thông tin chính */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Đơn hàng #{order.MAHD}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Ngày đặt: {new Date(order.NGAYLAP).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                      {order.TRANGTHAI}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 items-center text-gray-600 text-sm mb-2">
                       <span className="text-lg text-gray-400">📍</span> 
                       <span className="font-medium">Địa chỉ giao:</span> 
                       <span>{order.DIACHIGIAO}</span>
                    </div>
                    <div className="flex gap-2 items-center text-gray-600 text-sm">
                       <span className="text-lg text-gray-400">💳</span> 
                       <span className="font-medium">Thanh toán:</span> 
                       <span>{order.TENPTTT}</span>
                    </div>
                  </div>
                </div>

                {/* Vùng thanh toán & Hành động */}
                <div className="bg-gray-50/50 p-6 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between min-w-[250px]">
                  <div>
                    <span className="text-sm text-gray-500">Tổng thanh toán</span>
                    <p className="text-3xl font-extrabold text-green-600 mt-1">
                      {order.TONGTIEN?.toLocaleString()} đ
                    </p>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2">
                    <button className="w-full py-2.5 rounded-xl border-2 border-green-600 text-green-600 font-bold hover:bg-green-50 transition">
                      Xem chi tiết
                    </button>
                    {isCancellable && (
                      <button 
                        onClick={() => handleCancelOrder(order.MAHD)}
                        className="w-full py-2.5 rounded-xl text-red-500 font-bold hover:bg-red-50 transition"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    {isReceivable && (
                      <button 
                        onClick={() => handleReceiveOrder(order.MAHD)}
                        className="w-full py-2.5 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 shadow-md shadow-green-200 transition"
                      >
                        Đã Nhận Hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
