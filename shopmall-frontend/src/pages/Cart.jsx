// shopmall-frontend/src/pages/Cart.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import orderService from "../services/orderService";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    fetchCartItems,
    updateQuantity,
    removeItem,
    increaseQuantity,
    decreaseQuantity
  } = useContext(CartContext);

  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diachi, setDiachi] = useState("");
  const [mapttt, setMapttt] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCartItems();
    const userString = localStorage.getItem("user");
    if (userString && userString !== "undefined") {
      try {
        const userData = JSON.parse(userString);
        setUser(userData);
        // Nếu có địa chỉ trong user thì set mặc định
        if (userData.DIACHI) {
          setDiachi(userData.DIACHI);
        }
      } catch (error) {
        console.error("Lỗi parse user:", error);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 flex flex-col items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-green-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-8 mx-4">
        <div className="text-8xl mb-6">🛒</div>
        <p className="text-gray-600 text-xl font-medium mb-2">Giỏ hàng của bạn đang trống</p>
        <p className="text-gray-400 mb-8">Hãy tìm thêm các mặt hàng nông sản tươi sạch nhé!</p>
        <button 
          onClick={() => navigate("/")} 
          className="inline-block bg-green-600 shadow-md shadow-green-200 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.THANHTIEN || 0), 0);
  const grandTotal = total;

  const handleOpenCheckout = () => {
    if (!user) {
      alert("Bạn cần đăng nhập để tiến hành thanh toán!");
      navigate("/login");
      return;
    }
    setIsModalOpen(true);
  };

  // ✅ SỬA: Lấy danh sách MASP hiện tại từ cartItems (đã được đồng bộ)
  const submitCheckout = async () => {
    if (!diachi.trim()) {
      alert("⚠️ Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    // ✅ QUAN TRỌNG: Lấy danh sách MASP trực tiếp từ state hiện tại
    const danhSachSP = cartItems.map(item => item.MASP);
    
    if (danhSachSP.length === 0) {
      alert("⚠️ Giỏ hàng trống, không thể thanh toán!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        matk: user.MATK,
        mapttt: mapttt,
        diachigiao: diachi,
        danhSachSP: danhSachSP
      };

      console.log("📦 Đang gửi đơn hàng:", payload);

      const res = await orderService.checkout(payload);

      if (res.success) {
        setIsModalOpen(false);
        // ✅ Refresh lại giỏ hàng từ server sau khi thanh toán thành công
        await fetchCartItems();
        alert("✅ Đặt hàng thành công!");
        navigate("/");
      } else {
        alert("❌ Đặt hàng thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi tạo hóa đơn.";
      alert("❌ Lỗi: " + errorMsg);
      // Nếu có lỗi, refresh lại giỏ hàng để đồng bộ
      await fetchCartItems();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Hàm xóa sản phẩm có refresh
  const handleRemoveItem = async (masp) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?");
    if (!confirmDelete) return;
    
    await removeItem(masp);
    // ✅ Refresh lại toàn bộ giỏ hàng sau khi xóa
    await fetchCartItems();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-green-500 pl-3">
        Giỏ hàng của bạn ({cartItems.length} sản phẩm)
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn giá</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thành tiền</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cartItems.map((item) => (
                  <tr key={item.MASP} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <img
                          src={item.HINHANH && item.HINHANH !== 'null' && item.HINHANH !== 'default.jpg' ? `http://localhost:5000/uploads/${item.HINHANH}` : "https://via.placeholder.com/150?text=No+Image"}
                          alt={item.TENSP}
                          className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                        />
                        <div className="ml-5">
                          <p className="font-bold text-gray-800 text-base mb-1 hover:text-green-600 cursor-pointer" onClick={() => navigate(`/product/${item.MASP}`)}>{item.TENSP}</p>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">Mã SP: {item.MASP}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-gray-600 font-medium">{item.DONGIA?.toLocaleString()} đ</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => decreaseQuantity(item.MASP, item.SOLUONG)}
                          className="w-8 h-8 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:border-green-500 hover:text-green-500 transition active:bg-green-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.SOLUONG}
                          onChange={async (e) => {
                            const newValue = parseInt(e.target.value);
                            if (!isNaN(newValue) && newValue >= 1) {
                              await updateQuantity(item.MASP, newValue);
                              await fetchCartItems(); // ✅ Refresh sau khi cập nhật
                            }
                          }}
                          className="w-14 text-center font-bold text-gray-700 bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => increaseQuantity(item.MASP, item.SOLUONG)}
                          className="w-8 h-8 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:border-green-500 hover:text-green-500 transition active:bg-green-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-bold text-green-600 text-lg">{item.THANHTIEN?.toLocaleString()} đ</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.MASP)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                        title="Xóa khỏi giỏ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Cộng giỏ hàng</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-600 pb-4 border-b border-gray-100">
                <span>Tạm tính ({cartItems.length} Món):</span>
                <span className="font-semibold text-gray-800">{total.toLocaleString()} đ</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-3xl font-extrabold text-green-600">{grandTotal.toLocaleString()} đ</span>
                </div>
                <p className="text-xs text-right text-gray-400 font-medium mb-6">(Đã bao gồm VAT nếu có)</p>
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              className="w-full bg-green-600 text-white text-lg py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 active:scale-95"
            >
              Tiến hành thanh toán
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 bg-gray-50 text-gray-600 text-base py-3 rounded-xl font-semibold hover:bg-gray-100 hover:text-gray-800 transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CHỐT ĐƠN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Xác nhận thanh toán</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📍 Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={diachi}
                  onChange={(e) => setDiachi(e.target.value)}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-gray-50 text-gray-800"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💳 Phương thức thanh toán
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${mapttt === 1 ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="pttt"
                      value={1}
                      checked={mapttt === 1}
                      onChange={() => setMapttt(1)}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex gap-2 items-center">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-semibold text-gray-800">Thanh toán tiền mặt (COD)</p>
                        <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${mapttt === 2 ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="pttt"
                      value={2}
                      checked={mapttt === 2}
                      onChange={() => setMapttt(2)}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex gap-2 items-center">
                      <span className="text-2xl">🏦</span>
                      <div>
                        <p className="font-semibold text-gray-800">Chuyển khoản / Quẹt thẻ</p>
                        <p className="text-xs text-gray-500">ATM/Visa/MasterCard/Momo</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={submitCheckout}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center min-w-[120px] transition hover:bg-green-700 active:scale-95 disabled:bg-green-400"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  `Chốt Đơn (${grandTotal.toLocaleString()}đ)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;