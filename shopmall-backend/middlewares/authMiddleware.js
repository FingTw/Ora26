const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Lấy token từ Header của request
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Tách chữ "Bearer " ra lấy mỗi token

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Truy cập bị từ chối. Không tìm thấy Token!",
      });
  }

  try {
    // Dùng chìa khóa để giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin giải mã (vd: matk, role) vào req để các hàm sau xài
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = verifyToken;
