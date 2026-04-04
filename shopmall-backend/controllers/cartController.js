const oracledb = require("oracledb");

const cartController = {
  // 1. API: Thêm sản phẩm vào giỏ
  addToCart: async (req, res) => {
    const { masp, soluong } = req.body;
    const matk = req.user.id; // 🔒 Lấy từ token

    let connection;
    try {
      connection = await oracledb.getConnection();
      console.log(
        "Đang thêm giỏ hàng cho User:",
        matk,
        "Sản phẩm:",
        masp,
        "SL:",
        soluong,
      );
      await connection.execute(
        `BEGIN 
      SP_THEM_VAO_GIO(:p_matk, :p_masp, :p_soluong); 
   END;`,
        {
          p_matk: matk, // Phải khớp với tên tham số trong PROCEDURE
          p_masp: masp,
          p_soluong: soluong,
        },
      );

      res.status(200).json({ success: true, message: "Đã thêm vào giỏ hàng!" });
    } catch (err) {
      console.error("Lỗi thêm vào giỏ:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi Server khi thêm vào giỏ!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  // 2. API: Lấy chi tiết giỏ hàng của 1 user
  // 2. API: Lấy chi tiết giỏ hàng của 1 user
getCart: async (req, res) => {
  const matk = req.user.id;
  let connection;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT * FROM V_CHITIET_GIOHANG WHERE MATK = :matk`,
      { matk },
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // ✅ THÊM: Lấy dữ liệu dạng object
    );

    console.log("Cart data:", result.rows); // Debug

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Lỗi xem giỏ hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi Server!" });
  } finally {
    if (connection) await connection.close();
  }
},

  // 3. API: Cập nhật số lượng (hoặc xóa nếu số lượng = 0)
  updateCartItem: async (req, res) => {
    const { masp, soluong_moi } = req.body;
    const matk = req.user.id; // 🔒 Đã sửa: Lấy từ token thay vì Body

    let connection;
    try {
      connection = await oracledb.getConnection();
      await connection.execute(
        `BEGIN SP_CAPNHAT_GIOHANG(:matk, :masp, :soluong_moi); END;`,
        { matk, masp, soluong_moi },
      );

      res.status(200).json({ success: true, message: "Đã cập nhật giỏ hàng!" });
    } catch (err) {
      console.error("Lỗi cập nhật giỏ:", err);
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  getCartCount: async (req, res) => {
    const matk = req.user.id;
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `BEGIN :ret := FN_DEM_SL_GIOHANG(:matk); END;`,
        {
          matk: matk,
          ret: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      // Oracle trả về số trong outBinds.ret
      const count = result.outBinds.ret || 0;

      res.status(200).json({
        success: true,
        count: count,
      });
    } catch (err) {
      console.error("Lỗi đếm giỏ hàng:", err);
      res.status(500).json({ success: false, count: 0 });
    } finally {
      if (connection) await connection.close();
    }
  },
};

module.exports = cartController;
