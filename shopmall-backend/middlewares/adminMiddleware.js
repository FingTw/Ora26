const verifyToken = require("./authMiddleware");

const verifyAdminToken = (req, res, next) => {
  verifyToken(req, res, () => {
    // verifyToken middleware assigns req.user if valid
    if (req.user && Number(req.user.role) === 1) {
      next(); // Cho đi tiếp vào Controller Admin
    } else {
      res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng này (Requires Admin Role 1)!",
      });
    }
  });
};

module.exports = verifyAdminToken;
