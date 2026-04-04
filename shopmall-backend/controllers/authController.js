const oracledb = require("oracledb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
  login: async (req, res) => {
    const { email, matkhau } = req.body;
    let connection;

    try {
      connection = await oracledb.getConnection();

      const result = await connection.execute(
        `SELECT MATK, EMAIL, MATKHAU, HOTEN, MAVAITRO 
         FROM TAIKHOAN 
         WHERE EMAIL = :email`,
        { email: email },
      );

      // Nếu mảng rows rỗng -> Không tìm thấy Email này trong hệ thống
      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Sai email hoặc mật khẩu!" });
      }

      // Lấy thông tin user từ kết quả DB
      const user = result.rows[0];

      // 2. Dùng bcrypt để đối chiếu mật khẩu khách nhập với chuỗi băm lưu trong DB
      const isMatch = await bcrypt.compare(matkhau, user.MATKHAU);

      if (isMatch) {
        delete user.MATKHAU;

        const token = jwt.sign(
          {
            id: user.MATK,
            role: user.MAVAITRO,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" },
        );

        res.status(200).json({
          success: true,
          message: "Đăng nhập thành công!",
          token: token,
          user: user,
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Sai email hoặc mật khẩu!" });
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },

  register: async (req, res) => {
    const { email, matkhau, hoten, sdt } = req.body;
    let connection;

    try {
      // 1. Băm mật khẩu với độ khó là 10 (Salt rounds)
      const saltRounds = 10;
      const hashedMatkhau = await bcrypt.hash(matkhau, saltRounds);

      connection = await oracledb.getConnection();

      await connection.execute(
        `BEGIN 
            SP_DANGKY_TAIKHOAN(:email, :matkhau, :hoten, :sdt); 
        END;`,
        {
          email: email,
          matkhau: hashedMatkhau,
          hoten: hoten,
          sdt: sdt,
        },
      );

      res.status(201).json({ success: true, message: "Đăng ký thành công!" });
    } catch (err) {
      if (err.message.includes("ORA-20001")) {
        return res
          .status(400)
          .json({ success: false, message: "Email đã tồn tại!" });
      }
      res.status(500).json({ success: false, message: "Lỗi Server!" });
    } finally {
      if (connection) await connection.close();
    }
  },
};

module.exports = authController;
