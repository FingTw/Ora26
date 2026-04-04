// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Các state lưu trữ dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    hoten: "",
    email: "",
    matkhau: "",
    sdt: "",
  });

  // State thông báo lỗi hoặc thành công
  const [message, setMessage] = useState({ text: "", type: "" });

  // Hàm bắt sự kiện khi người dùng gõ vào ô input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút Submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang bị reload
    setMessage({ text: "Đang xử lý...", type: "info" });

    try {
      if (isLogin) {
        // GỌI API ĐĂNG NHẬP
        const res = await authService.login({
          email: formData.email,
          matkhau: formData.matkhau,
        });

        setMessage({ text: "Đăng nhập thành công!", type: "success" });

        // Lưu thông tin user vào localStorage để các trang khác biết là đã đăng nhập
        const userDataToSave = { ...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userDataToSave));

        if (Number(res.user.MAVAITRO) === 1) {
          setTimeout(() => {
            window.location.href = "/admin";
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      } else {
        // GỌI API ĐĂNG KÝ
        await authService.register(formData);
        setMessage({
          text: "Đăng ký thành công! Vui lòng đăng nhập.",
          type: "success",
        });

        setTimeout(() => {
          setIsLogin(true);
          setFormData({ ...formData, matkhau: "" });
          setMessage({ text: "", type: "" });
        }, 1500);
      }
    } catch (error) {
      setMessage({ text: error.message || "Có lỗi xảy ra", type: "error" });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          {isLogin ? "Đăng Nhập" : "Đăng Ký"}
        </h2>

        {/* Khung hiển thị thông báo */}
        {message.text && (
          <div
            className={`p-3 mb-4 rounded ${message.type === "error" ? "bg-red-100 text-red-600" : message.type === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                name="hoten"
                value={formData.hoten}
                onChange={handleChange}
                required={!isLogin}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập họ tên..."
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email..."
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="matkhau"
              value={formData.matkhau}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập mật khẩu..."
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                required={!isLogin}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập số điện thoại..."
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
          >
            {isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ TÀI KHOẢN"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ text: "", type: "" }); // Xóa thông báo khi chuyển tab
            }}
            className="text-green-600 font-semibold hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
