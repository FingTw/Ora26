const oracledb = require("oracledb");

oracledb.fetchAsString = [oracledb.CLOB];

const productController = {
  // 1. API Lấy danh sách Danh mục (Rau củ, Trái cây...)
  getCategories: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();

      // Truy vấn thẳng vào VIEW (rất an toàn vì ẩn cấu trúc bảng thật)
      const result = await connection.execute(`SELECT * FROM V_MENU_DANHMUC`);

      // result.rows sẽ chứa mảng dữ liệu lấy từ DB
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi Server khi tải danh mục!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 2. API Lấy danh sách Sản phẩm (Chỉ lấy SP còn hàng và shop đang hoạt động)
  getProducts: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();

      // Truy vấn vào VIEW Sản phẩm
      const result = await connection.execute(
        `SELECT * FROM V_CHITIET_SANPHAM_WEB`,
      );

      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi Server khi tải sản phẩm!" });
    } finally {
      if (connection) await connection.close();
    }
  },
};

module.exports = productController;
