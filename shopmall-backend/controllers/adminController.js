const oracledb = require("oracledb");
const bcrypt = require("bcrypt");

const adminController = {
  getDashboard: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(`SELECT * FROM V_ADMIN_THONGKE`);
      res.status(200).json({ success: true, data: result.rows[0] || {} });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Dashboard" });
    } finally {
      if (connection) await connection.close();
    }
  },

  getUsers: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(`SELECT * FROM V_ADMIN_TAIKHOAN`);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  addUser: async (req, res) => {
    let connection;
    const { email, matkhau, hoten, sdt, mavaitro } = req.body;
    try {
      const saltRounds = 10;
      const hashedMatkhau = await bcrypt.hash(matkhau, saltRounds);

      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_THEM_TAIKHOAN(:email, :matkhau, :hoten, :sdt, :mavaitro); END;`,
        { email, matkhau: hashedMatkhau, hoten, sdt, mavaitro }
      );
      res.status(201).json({ success: true, message: "Thêm thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  updateUser: async (req, res) => {
    let connection;
    const p_matk = req.params.id;
    const { hoten, sdt, mavaitro } = req.body;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_SUA_TAIKHOAN(:matk, :hoten, :sdt, :mavaitro); END;`,
        { matk: p_matk, hoten, sdt, mavaitro }
      );
      res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  deleteUser: async (req, res) => {
    let connection;
    const p_matk = req.params.id;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_XOA_TAIKHOAN(:matk); END;`,
        { matk: p_matk }
      );
      res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi xóa / vướng khóa ngoại" });
    } finally {
      if (connection) await connection.close();
    }
  },

  getCategories: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(`SELECT * FROM V_ADMIN_LOAISP`);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  addCategory: async (req, res) => {
    let connection;
    const { tenloai } = req.body;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_THEM_LOAISP(:tenloai); END;`,
        { tenloai }
      );
      res.status(201).json({ success: true, message: "Thêm thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  updateCategory: async (req, res) => {
    let connection;
    const p_maloai = req.params.id;
    const { tenloai } = req.body;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_SUA_LOAISP(:maloai, :tenloai); END;`,
        { maloai: p_maloai, tenloai }
      );
      res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  deleteCategory: async (req, res) => {
    let connection;
    const p_maloai = req.params.id;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_XOA_LOAISP(:maloai); END;`,
        { maloai: p_maloai }
      );
      res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi xóa / vướng khóa ngoại" });
    } finally {
      if (connection) await connection.close();
    }
  },

  getShops: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(`SELECT * FROM V_ADMIN_CUAHANG`);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  updateShop: async (req, res) => {
    let connection;
    const p_mach = req.params.id;
    const { trangthai } = req.body;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_SUA_CUAHANG(:mach, :trangthai); END;`,
        { mach: p_mach, trangthai: trangthai }
      );
      res.status(200).json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  deleteShop: async (req, res) => {
    let connection;
    const p_mach = req.params.id;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_ADMIN_XOA_CUAHANG(:mach); END;`,
        { mach: p_mach }
      );
      res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi: Không thể xóa do vướng khóa ngoại (SP/Hóa đơn)" });
    } finally {
      if (connection) await connection.close();
    }
  },

  getOrders: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(`SELECT * FROM V_ADMIN_HOADON`);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // API biểu đồ phân tích Dashboard
  getChartData: async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection();

      // 1. Dữ liệu trạng thái đơn hàng
      const orderStatus = await connection.execute(
        `SELECT TRANGTHAI, COUNT(*) AS SOLUONG FROM HOADON GROUP BY TRANGTHAI ORDER BY SOLUONG DESC`
      );

      // 2. Sản phẩm theo danh mục
      const productByCategory = await connection.execute(
        `SELECT l.TENLOAI, COUNT(sp.MASP) AS SOLUONG 
         FROM SANPHAM sp JOIN LOAISP l ON sp.MALOAI = l.MALOAI 
         GROUP BY l.TENLOAI ORDER BY SOLUONG DESC`
      );

      // 3. Top 5 cửa hàng doanh thu cao nhất
      const topShops = await connection.execute(
        `SELECT ch.TENCH, NVL(SUM(ct.SOLUONG * ct.DONGIALUCMUA), 0) AS DOANHTHU
         FROM CUAHANG ch
         LEFT JOIN SANPHAM sp ON sp.MACH = ch.MACH
         LEFT JOIN CTHD ct ON ct.MASP = sp.MASP
         LEFT JOIN HOADON hd ON hd.MAHD = ct.MAHD AND hd.TRANGTHAI = 'HOÀN THÀNH'
         GROUP BY ch.TENCH ORDER BY DOANHTHU DESC
         FETCH FIRST 5 ROWS ONLY`
      );

      // 4. Tương quan người dùng theo vai trò
      const userByRole = await connection.execute(
        `SELECT vt.TENVAITRO, COUNT(tk.MATK) AS SOLUONG
         FROM TAIKHOAN tk JOIN VAITRO vt ON tk.MAVAITRO = vt.MAVAITRO
         GROUP BY vt.TENVAITRO`
      );

      res.status(200).json({
        success: true,
        data: {
          orderStatus: orderStatus.rows,
          productByCategory: productByCategory.rows,
          topShops: topShops.rows,
          userByRole: userByRole.rows
        }
      });
    } catch (err) {
      console.error("Lỗi lấy chart data:", err);
      res.status(500).json({ success: false, message: "Lỗi Server" });
    } finally {
      if (connection) await connection.close();
    }
  }
};

module.exports = adminController;
