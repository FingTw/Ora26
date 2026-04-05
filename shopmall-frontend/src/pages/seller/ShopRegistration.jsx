import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShopRegistration = () => {
  const [formData, setFormData] = useState({ tench: '', diachi: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userString);
      const token = user.token;

      const response = await fetch('http://localhost:5000/api/seller/open-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matk: user.MATK,
          tench: formData.tench,
          diachi: formData.diachi,
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Đăng ký cửa hàng thành công! Đang chuyển hướng...');
        
        // Cập nhật role trong localStorage
        user.MAVAITRO = 3;
        localStorage.setItem('user', JSON.stringify(user));
        
        setTimeout(() => {
          navigate('/shop/management');
          window.location.reload(); // Reload to update Navbar
        }, 2000);
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối Server');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Đăng Ký Bán Hàng</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
          <input
            type="text"
            name="tench"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập tên cửa hàng của bạn"
            onChange={handleChange}
            value={formData.tench}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cửa hàng</label>
          <textarea
            name="diachi"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập địa chỉ cửa hàng"
            rows="3"
            onChange={handleChange}
            value={formData.diachi}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Mở Cửa Hàng
        </button>
      </form>
    </div>
  );
};

export default ShopRegistration;
