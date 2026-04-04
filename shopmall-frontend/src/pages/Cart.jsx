// shopmall-frontend/src/pages/Cart.jsx
import { useContext, useEffect } from "react";
import { CartContext } from "../contexts/CartContext";

const Cart = () => {
  const { 
    cartItems, 
    loading, 
    fetchCartItems, 
    updateQuantity,
    removeItem,
    increaseQuantity,
    decreaseQuantity
  } = useContext(CartContext);

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-2 text-gray-500">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</p>
        <a href="/" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Tiếp tục mua sắm
        </a>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.THANHTIEN || 0), 0);
  const shipping = total > 500000 ? 0 : 30000; // Miễn phí ship cho đơn > 500k
  const grandTotal = total + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn ({cartItems.length} sản phẩm)</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.MASP}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={item.HINHANH ? `http://localhost:5000/uploads/${item.HINHANH}` : "/placeholder.jpg"} 
                          alt={item.TENSP} 
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => { e.target.src = "/placeholder.jpg" }}
                        />
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{item.TENSP}</p>
                          <p className="text-sm text-gray-500">Mã SP: {item.MASP}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{item.DONGIA?.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* Nút giảm số lượng */}
                        <button
                          onClick={() => decreaseQuantity(item.MASP, item.SOLUONG)}
                          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
                        >
                          -
                        </button>
                        
                        {/* Hiển thị số lượng */}
                        <input
                          type="number"
                          min="1"
                          value={item.SOLUONG}
                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value);
                                            if (!isNaN(newValue) && newValue >= 1) {
                                              updateQuantity(item.MASP, newValue);
                                            }
                                          }}
                          className="w-16 text-center px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        
                        {/* Nút tăng số lượng */}
                        <button
                          onClick={() => increaseQuantity(item.MASP, item.SOLUONG)}
                          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">{item.THANHTIEN?.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeItem(item.MASP)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Xóa sản phẩm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Thông tin đơn hàng</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{total.toLocaleString()}đ</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString()}đ`}
                </span>
              </div>
              
              {shipping > 0 && total < 500000 && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  💡 Mua thêm {(500000 - total).toLocaleString()}đ để được miễn phí vận chuyển
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{grandTotal.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition">
              Tiến hành thanh toán
            </button>
            
            <button className="w-full mt-3 text-gray-600 py-2 rounded-lg hover:text-green-600 transition">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;