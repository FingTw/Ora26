const oracledb = require("oracledb");

const sellerController = {
  // 1. API: Đăng ký mở cửa hàng (Nâng quyền user lên Người bán)
  openStore: async (req, res) => {
    const { matk, tench, diachi } = req.body;
    let connection;

    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_MO_CUAHANG(:matk, :tench, :diachi); END;`,
        { matk, tench, diachi },
      );

      res.status(200).json({
        success: true,
        message: "Chúc mừng! Bạn đã mở cửa hàng thành công.",
      });
    } catch (err) {
      console.error("Lỗi mở cửa hàng:", err);
      // Bắt lỗi nếu tài khoản đã có cửa hàng
      if (err.message.includes("ORA-20009")) {
        return res.status(400).json({
          success: false,
          message: "Tài khoản này đã sở hữu một cửa hàng!",
        });
      }
      res
        .status(500)
        .json({ success: false, message: "Lỗi Server khi mở cửa hàng!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 2. API: Chủ shop đăng bán sản phẩm mới
  addProduct: async (req, res) => {
    const { matk, tensp, mota, dongia, soluongton, maloai } = req.body;

    // Lấy tên file ảnh mà Multer vừa lưu xong. Nếu khách quên up ảnh thì để 'default.jpg'
    const hinhanh = req.file ? req.file.filename : "default.jpg";

    let connection;

    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_DANG_SANPHAM(:matk, :tensp, :mota, :dongia, :soluongton, :hinhanh, :maloai); END;`,
        {
          matk: Number(matk),
          tensp,
          mota,
          dongia: Number(dongia),
          soluongton: Number(soluongton),
          hinhanh, // Chỉ lưu cái tên (vd: 1712345678_anh.jpg) xuống Database
          maloai: Number(maloai),
        },
      );

      res.status(201).json({
        success: true,
        message: "Đăng bán sản phẩm thành công!",
        imageUrl: `http://localhost:5000/uploads/${hinhanh}`, // Trả về link xem ảnh luôn
      });
    } catch (err) {
      console.error("Lỗi đăng sản phẩm:", err);
      if (err.message.includes("ORA-20011"))
        return res
          .status(403)
          .json({ success: false, message: "Bạn phải mở cửa hàng trước!" });
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 3. API: Xem danh sách người khác đặt mua hàng của Shop mình
  getShopOrders: async (req, res) => {
    const { matk } = req.params; // Truyền mã tài khoản của CHỦ SHOP
    let connection;

    try {
      connection = await oracledb.getConnection();
      // Lọc từ View ra những đơn hàng mua đồ của cửa hàng do MATK này làm chủ
      const result = await connection.execute(
        `SELECT * FROM V_DONHANG_CUA_SHOP WHERE MATK_CHUSHOP = :matk ORDER BY NGAYLAP DESC`,
        { matk },
      );

      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 4. API: Chủ shop cập nhật trạng thái đơn hàng (Đang giao, Hoàn thành...)
  updateOrderStatus: async (req, res) => {
    const { matk, mahd, trangthaimoi } = req.body;
    let connection;

    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_CAPNHAT_TRANGTHAI_HD(:mahd, :trangthaimoi, :matk); END;`,
        { mahd, trangthaimoi, matk },
      );

      res.status(200).json({
        success: true,
        message: `Đã cập nhật trạng thái đơn hàng thành: ${trangthaimoi}`,
      });
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      if (err.message.includes("ORA-20007"))
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này!",
        });
      if (err.message.includes("ORA-20014"))
        return res
          .status(403)
          .json({ success: false, message: "Bạn chưa có cửa hàng!" });

      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 5. API: Lấy thông tin cửa hàng của một user cụ thể
  getShopInfo: async (req, res) => {
    const { matk } = req.params;
    let connection;

    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `BEGIN SP_LAY_THONGTIN_CUAHANG(:matk, :cursor); END;`,
        {
          matk,
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        }
      );

      const cursor = result.outBinds.cursor;
      const row = await cursor.getRow();
      await cursor.close();

      if (row) {
        res.status(200).json({ success: true, data: row });
      } else {
        res.status(404).json({ success: false, message: "Người dùng chưa đăng ký cửa hàng!" });
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin cửa hàng:", err);
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 6. API: Lấy danh sách sản phẩm của cửa hàng
  getShopProducts: async (req, res) => {
    const { matk } = req.params;
    let connection;

    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `BEGIN SP_LAY_SANPHAM_CUAHANG(:matk, :cursor); END;`,
        {
          matk,
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );

      const cursor = result.outBinds.cursor;
      const rows = [];
      let row;
      while ((row = await cursor.getRow())) {
        rows.push(row);
      }
      await cursor.close();

      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 7. API: Sửa sản phẩm
  updateProduct: async (req, res) => {
    const { id } = req.params; // masp
    const { matk, tensp, mota, dongia, soluongton, maloai } = req.body;
    const hinhanh = req.file ? req.file.filename : "";

    let connection;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_SUA_SANPHAM(:matk, :masp, :tensp, :mota, :dongia, :soluongton, :maloai, :hinhanh); END;`,
        {
          matk: Number(matk),
          masp: Number(id),
          tensp,
          mota,
          dongia: Number(dongia),
          soluongton: Number(soluongton),
          maloai: Number(maloai),
          hinhanh: hinhanh
        }
      );

      res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công!" });
    } catch (err) {
      console.error("Lỗi sửa sản phẩm:", err);
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 8. API: Xoá sản phẩm
  deleteProduct: async (req, res) => {
    const { id } = req.params; // masp
    const { matk } = req.body;

    let connection;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_XOA_SANPHAM(:matk, :masp); END;`,
        {
          matk: Number(matk),
          masp: Number(id)
        }
      );

      res.status(200).json({ success: true, message: "Đã xoá sản phẩm!" });
    } catch (err) {
      console.error("Lỗi xoá sản phẩm:", err);
      if (err.message.includes("ORA-02292")) {
        return res.status(400).json({ success: false, message: "Không thể xóa sản phẩm đã phát sinh giao dịch/hóa đơn! Bạn hãy cập nhật số lượng về 0." });
      }
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  }
};

module.exports = sellerController;
