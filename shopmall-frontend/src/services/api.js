import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("user");

    // KIỂM TRA THÊM: Đảm bảo userString không phải là chữ "undefined"
    if (userString && userString !== "undefined") {
      try {
        const userData = JSON.parse(userString);
        if (userData?.token) {
          config.headers["Authorization"] = `Bearer ${userData.token}`;
        }
      } catch (error) {
        // Nếu lỡ có rác không parse được, tự động dọn luôn!
        console.error("Lỗi đọc token, tiến hành dọn dẹp:", error);
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
