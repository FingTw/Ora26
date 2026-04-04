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
  }
};

module.exports = adminController;
