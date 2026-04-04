const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function initialize() {
  try {
    await oracledb.createPool({
      user: "c##shopmall_admin",
      password: "123456",
      connectString: "localhost:1521/FREE",

      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log("✅ Kết nối Oracle Database thành công!");
  } catch (err) {
    console.error("❌ Lỗi kết nối Oracle:", err);
    process.exit(1);
  }
}

async function close() {
  await oracledb.getPool().close(0);
}

module.exports = { initialize, close };
