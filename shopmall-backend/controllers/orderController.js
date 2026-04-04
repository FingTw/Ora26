const oracledb = require("oracledb");

const orderController = {
  // 1. API: Chốt đơn hàng (Checkout)
  checkout: async (req, res) => {
    // MỚI: Nhận thêm mảng danhSachSP từ Frontend
    const { matk, mapttt, diachigiao, danhSachSP } = req.body;
    let connection;

    // Kiểm tra tính hợp lệ của mảng sản phẩm được chọn
    if (!danhSachSP || !Array.isArray(danhSachSP) || danhSachSP.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!",
        });
    }

    // Biến mảng [1, 2, 5] thành chuỗi "1,2,5" để gửi xuống Oracle
    const chuoiDanhSachSP = danhSachSP.join(",");

    try {
      connection = await oracledb.getConnection();

      const result = await connection.execute(
        `BEGIN SP_CHOT_DON_HANG(:matk, :mapttt, :diachigiao, :chuoiSP, :mahd); END;`,
        {
          matk: Number(matk),
          mapttt: Number(mapttt),
          diachigiao: String(diachigiao),
          chuoiSP: String(chuoiDanhSachSP), // THAM SỐ THỨ 4: Chuỗi mã sản phẩm
          mahd: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, // THAM SỐ THỨ 5
        },
      );

      res.status(200).json({
        success: true,
        message: "Đặt hàng thành công!",
        maHoaDon: result.outBinds.mahd,
      });
    } catch (err) {
      console.error("Lỗi chốt đơn:", err);
      if (err.message.includes("ORA-20003"))
        return res
          .status(400)
          .json({ success: false, message: "Sản phẩm chọn mua không hợp lệ!" });
      if (err.message.includes("ORA-20015"))
        return res
          .status(400)
          .json({ success: false, message: "Chưa chọn sản phẩm nào!" });

      res
        .status(500)
        .json({ success: false, message: "Lỗi Server khi đặt hàng!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 2. API: Xem lịch sử đơn hàng của 1 tài khoản
  getHistory: async (req, res) => {
    const { matk } = req.params;
    let connection;

    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT * FROM V_LICHSU_DONHANG_KHACH WHERE MATK = :matk`,
        { matk },
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 3. API: Xem chi tiết của 1 đơn hàng cụ thể
  getOrderDetails: async (req, res) => {
    const { mahd } = req.params;
    let connection;

    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT * FROM V_CHITIET_HOADON WHERE MAHD = :mahd`,
        { mahd },
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 4. API: Khách hàng hủy đơn
  cancelOrder: async (req, res) => {
    const { mahd, matk } = req.body;
    let connection;

    try {
      connection = await oracledb.getConnection();
      await connection.execute(`BEGIN SP_HUY_DONHANG(:mahd, :matk); END;`, {
        mahd,
        matk,
      });
      res
        .status(200)
        .json({ success: true, message: "Đã hủy đơn hàng thành công!" });
    } catch (err) {
      if (err.message.includes("ORA-20006")) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng không tồn tại hoặc không thể hủy lúc này!",
        });
      }
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },
};

module.exports = orderController;
