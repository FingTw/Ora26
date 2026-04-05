import React, { useState, useEffect } from 'react';

const ShopManagement = () => {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({ tensp: '', mota: '', dongia: '', soluongton: '', maloai: 1 });
  const [imageFile, setImageFile] = useState(null);

  const fetchShopData = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      const token = user.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      const shopRes = await fetch(`http://localhost:5000/api/seller/shop-info/${user.MATK}`, { headers });
      const shopData = await shopRes.json();
      
      if (shopRes.ok && shopData.success) {
        setShop(shopData.data);
        
        const ordersRes = await fetch(`http://localhost:5000/api/seller/orders/${user.MATK}`, { headers });
        const ordersData = await ordersRes.json();
        if (ordersRes.ok && ordersData.success) {
          setOrders(ordersData.data);
        }

        const productsRes = await fetch(`http://localhost:5000/api/seller/products/myshop/${user.MATK}`, { headers });
        const productsData = await productsRes.json();
        if (productsRes.ok && productsData.success) {
          setProducts(productsData.data);
        }
      } else {
        setError('Không thể lấy thông tin cửa hàng. ' + (shopData.message || ''));
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleUpdateOrderStatus = async (mahd, trangthaimoi) => {
    if (!window.confirm(`Xác nhận đổi trạng thái đơn hàng #${mahd} thành "${trangthaimoi}"?`)) return;

    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    const token = user.token;

    try {
      const res = await fetch(`http://localhost:5000/api/seller/orders/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matk: user.MATK, mahd, trangthaimoi })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchShopData(); // Reload list
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      alert("Lỗi máy chủ khi cập nhật đơn hàng");
    }
  };

  const openAddModal = () => {
    setCurrentProduct(null);
    setFormData({ tensp: '', mota: '', dongia: '', soluongton: '', maloai: 1 });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setCurrentProduct(prod);
    setFormData({ 
      tensp: prod.TENSP, 
      mota: prod.MOTA || '', 
      dongia: prod.DONGIA, 
      soluongton: prod.SOLUONGTON, 
      maloai: prod.MALOAI || 1
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (masp) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    const token = user.token;
    
    try {
      const res = await fetch(`http://localhost:5000/api/seller/products/${masp}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matk: user.MATK })
      });
      const data = await res.json();
      if(res.ok && data.success) {
        fetchShopData();
      } else {
        alert(data.message || "Xoá thất bại");
      }
    } catch(err) {
      alert("Lỗi máy chủ");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    const token = user.token;

    const pushData = new FormData();
    pushData.append('matk', user.MATK);
    pushData.append('tensp', formData.tensp);
    pushData.append('mota', formData.mota);
    pushData.append('dongia', formData.dongia);
    pushData.append('soluongton', formData.soluongton);
    pushData.append('maloai', formData.maloai);
    if(imageFile) {
      pushData.append('hinhanh', imageFile);
    }

    try {
      let url = 'http://localhost:5000/api/seller/products';
      let method = 'POST';

      if(currentProduct) {
        url = `http://localhost:5000/api/seller/products/${currentProduct.MASP}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: pushData
      });

      const data = await res.json();
      if(res.ok && data.success) {
        alert(currentProduct ? "Cập nhật thành công!" : "Đăng bán thành công!");
        setIsModalOpen(false);
        fetchShopData();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch(err) {
      alert("Lỗi máy chủ khi lưu sản phẩm");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SHOP HEADER */}
        <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-green-500 to-emerald-400"></div>
          <div className="relative px-8 pt-20 pb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-xl flex-shrink-0 transform -translate-y-4">
              <div className="w-full h-full bg-green-50 rounded-xl flex items-center justify-center text-4xl">
                🏪
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{shop?.TENCH}</h1>
              <p className="text-gray-500 font-medium mt-1 mb-4 flex items-center justify-center sm:justify-start gap-2">
                <span>📍</span> {shop?.DIACHI}
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <span className="px-4 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {shop?.TRANGTHAI}
                </span>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-full text-sm">
                  {products.length} Sản phẩm
                </span>
                <span className="px-4 py-1.5 bg-orange-50 text-orange-600 font-bold rounded-full text-sm">
                  {orders.length} Đơn hàng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS */}
        <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-100 max-w-fit mx-auto sm:mx-0">
          <button 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('orders')}
          >
            <span>📦</span> Quản Lý Đơn Hàng
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('products')}
          >
            <span>🛍️</span> Kho Sản Phẩm
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Đơn Hàng Chờ Xử Lý</h3>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-6xl mb-4 opacity-50">📋</div>
                <p className="text-gray-500 font-medium text-lg">Cửa hàng chưa có đơn hàng nào phát sinh.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-5 font-bold">Mã Đơn</th>
                      <th className="p-5 font-bold">Khách Hàng</th>
                      <th className="p-5 font-bold">Sản Phẩm (SL)</th>
                      <th className="p-5 font-bold text-right">Tổng Thu</th>
                      <th className="p-5 font-bold text-center">Trạng Thái</th>
                      <th className="p-5 font-bold text-center">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order, index) => {
                      let statusBadge = "bg-gray-100 text-gray-600";
                      if (order.TRANGTHAI === 'CHỜ XÁC NHẬN') statusBadge = "bg-orange-100 text-orange-700";
                      if (order.TRANGTHAI === 'ĐANG XỬ LÝ') statusBadge = "bg-blue-100 text-blue-700";
                      if (order.TRANGTHAI === 'ĐANG GIAO') statusBadge = "bg-purple-100 text-purple-700";
                      if (order.TRANGTHAI === 'HOÀN THÀNH') statusBadge = "bg-green-100 text-green-700";
                      if (order.TRANGTHAI === 'ĐÃ HỦY') statusBadge = "bg-red-100 text-red-700";

                      return (
                        <tr key={index} className="hover:bg-gray-50/50 transition">
                          <td className="p-5 font-bold text-gray-800">#{order.MAHD}</td>
                          <td className="p-5">
                            <p className="font-bold text-gray-800">{order.TENKHACHHANG}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]" title={order.DIACHIGIAO}>{order.DIACHIGIAO}</p>
                          </td>
                          <td className="p-5">
                            <span className="font-medium text-gray-700">{order.TENSP}</span>
                            <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">x{order.SOLUONG}</span>
                          </td>
                          <td className="p-5 text-right font-extrabold text-green-600">
                            {order.THANHTIEN?.toLocaleString()}đ
                          </td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusBadge}`}>
                              {order.TRANGTHAI}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center justify-center gap-2">
                              {order.TRANGTHAI === 'CHỜ XÁC NHẬN' && (
                                <>
                                  <button onClick={() => handleUpdateOrderStatus(order.MAHD, 'ĐANG XỬ LÝ')} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg transition">Nhận Đơn</button>
                                  <button onClick={() => handleUpdateOrderStatus(order.MAHD, 'ĐÃ HỦY')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs rounded-lg transition">Từ chối</button>
                                </>
                              )}
                              {order.TRANGTHAI === 'ĐANG XỬ LÝ' && (
                                <button onClick={() => handleUpdateOrderStatus(order.MAHD, 'ĐANG GIAO')} className="px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white font-bold text-xs rounded-lg transition">Giao Hàng Dịch Vụ</button>
                              )}
                              {order.TRANGTHAI === 'ĐANG GIAO' && (
                                <span className="text-gray-500 font-bold text-sm">Chờ khách xác nhận...</span>
                              )}
                              {order.TRANGTHAI === 'HOÀN THÀNH' && (
                                <span className="text-green-500 font-bold text-sm">✓ Done</span>
                              )}
                              {order.TRANGTHAI === 'ĐÃ HỦY' && (
                                <span className="text-red-400 font-bold text-sm">✕ Canceled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-bold text-gray-800">Kho Sản Phẩm</h3>
              <button 
                onClick={openAddModal}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition transform hover:-translate-y-0.5"
              >
                + Đăng Bán Sản Phẩm
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center shadow-sm">
                <div className="text-7xl mb-6 opacity-30">🌻</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500 mb-6">Hãy đăng bán mặt hàng đầu tiên để thu hút khách hàng đến với shop của bạn.</p>
                <button onClick={openAddModal} className="px-6 py-3 border-2 border-green-600 text-green-600 font-bold rounded-xl hover:bg-green-50 transition">Đăng bán ngay</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(prod => (
                  <div key={prod.MASP} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition duration-300 group">
                    <div className="relative h-56 overflow-hidden bg-gray-50">
                      <img 
                        src={prod.HINHANH && prod.HINHANH !== 'null' ? `http://localhost:5000/uploads/${prod.HINHANH}` : 'https://via.placeholder.com/300?text=No+Data'} 
                        alt={prod.TENSP} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        onError={(e) => e.target.src = "https://via.placeholder.com/300?text=Image+Error"}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                        Kho: <span className={prod.SOLUONGTON > 0 ? "text-green-600" : "text-red-500"}>{prod.SOLUONGTON}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{prod.TENLOAI}</span>
                      </div>
                      <h4 className="font-extrabold text-lg text-gray-800 mb-1 truncate group-hover:text-green-600 transition" title={prod.TENSP}>{prod.TENSP}</h4>
                      <p className="text-2xl font-black text-green-600 mb-5">
                        {prod.DONGIA?.toLocaleString()}đ
                      </p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(prod)}
                          className="flex-1 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 border border-transparent transition"
                        >
                          Sửa Chữa
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.MASP)}
                          className="flex-none px-4 py-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-xl transition"
                          title="Xóa sản phẩm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                {currentProduct ? 'Sửa Chữa Sản Phẩm 🛠️' : 'Đăng Bán Sản Phẩm Mới 🌻'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center text-gray-500 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input 
                  type="text" required placeholder="Ví dụ: Cà chua hữu cơ Đà Lạt"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                  value={formData.tensp}
                  onChange={e => setFormData({...formData, tensp: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Đơn giá (VNĐ) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0" step="1000" placeholder="10000"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    value={formData.dongia}
                    onChange={e => setFormData({...formData, dongia: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng tồn kho <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0" placeholder="0"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    value={formData.soluongton}
                    onChange={e => setFormData({...formData, soluongton: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phân loại danh mục</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition font-medium text-gray-700"
                    value={formData.maloai}
                    onChange={e => setFormData({...formData, maloai: e.target.value})}
                  >
                    <option value={1}>🥬 Rau ăn lá</option>
                    <option value={2}>🍅 Củ quả tươi</option>
                    <option value={3}>🍎 Trái cây theo mùa</option>
                    <option value={4}>🌾 Gạo & Ngũ cốc</option>
                    <option value={5}>🍯 Đặc sản vùng miền</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                <textarea 
                  rows="4" placeholder="Nhập thêm thuộc tính, nơi sinh trưởng, lợi ích..."
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition resize-none"
                  value={formData.mota}
                  onChange={e => setFormData({...formData, mota: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hình ảnh minh hoạ {currentProduct && <span className="text-gray-400 font-normal">(Bỏ trống nếu giữ nguyên ảnh cũ)</span>}
                </label>
                <div className="w-full relative border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition text-center cursor-pointer">
                  <input 
                    type="file" accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => setImageFile(e.target.files[0])}
                    required={!currentProduct}
                  />
                  <div className="pointer-events-none">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {imageFile ? (
                      <p className="text-sm font-bold text-green-600">{imageFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">Kéo thả hoặc click để chọn ảnh</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP lên đến 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
            
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl focus:outline-none hover:bg-gray-100 transition w-full sm:w-auto"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleFormSubmit}
                type="submit"
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 focus:outline-none hover:bg-green-700 transition w-full sm:w-auto"
              >
                {currentProduct ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
