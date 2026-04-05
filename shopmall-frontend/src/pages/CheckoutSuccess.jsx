import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSuccess = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center max-w-xl w-full border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">Cảm Ơn, Đặt Hàng Thành Công! 🎉</h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
          Hệ thống đã ghi nhận đơn hàng mua Nông Sản Sạch của bạn. Các nhà vườn đang khẩn trương chuẩn bị và sẽ đóng gói gửi đến bạn sớm nhất có thể!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/user/orders"
            className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition transform hover:-translate-y-1"
          >
            Theo dõi đơn hàng
          </Link>
          <Link 
            to="/"
            className="flex-1 py-4 bg-gray-50 text-gray-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition transform hover:-translate-y-1"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
