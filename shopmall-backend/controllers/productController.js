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
  // Lấy danh sách sản phẩm phân trang cho trang chủ
  getProductsPaginated: async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN SP_LAY_SP_PHAN_TRANG(:page, :limit, :cursor, :total); END;`,
      {
        page,
        limit,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        total:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const cursor = result.outBinds.cursor;
    
    // ✅ oracledb v6: set fetchArraySize rồi dùng vòng lặp
    cursor.fetchArraySize = limit;
    
    let products = [];
    let rows;
    while ((rows = await cursor.getRows()) && rows.length > 0) {
      products = products.concat(rows);
    }
    
    await cursor.close();

    console.log(`Got ${products.length} rows`);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: result.outBinds.total,
        totalPages: Math.ceil(result.outBinds.total / limit)
      }
    });
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  } finally {
    if (connection) await connection.close();
  }
},
  
  // Lấy sản phẩm theo danh mục có phân trang
  getProductsByCategory: async (req, res) => {
    const { maloai } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `BEGIN SP_SP_THEO_LOAI_PHANTRANG(:maloai, :page, :limit, :cursor, :total); END;`,
        {
          maloai: maloai,
          page: page,
          limit: limit,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );
      
      const cursor = result.outBinds.cursor;
    
      // ✅ oracledb v6: set fetchArraySize rồi dùng vòng lặp
      cursor.fetchArraySize = limit;
      
      let products = [];
      let rows;
      while ((rows = await cursor.getRows()) && rows.length > 0) {
        products = products.concat(rows);
      }
      
      await cursor.close();
      
      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: result.outBinds.total,
          totalPages: Math.ceil(result.outBinds.total / limit)
        }
      });
    } catch (err) {
      console.error("Lỗi lấy sản phẩm theo danh mục:", err);
      res.status(500).json({ success: false, message: "Lỗi server!" });
    } finally {
      if (connection) await connection.close();
    }
  },
  
  // Tìm kiếm sản phẩm nâng cao có phân trang
  searchProducts: async (req, res) => {
    const { 
      keyword, 
      category, 
      minPrice, 
      maxPrice, 
      sort = 'moi_nhat',
      page = 1, 
      limit = 12 
    } = req.query;
    
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `BEGIN SP_TIMKIEM_PHANTRANG(
          :keyword, :category, :minPrice, :maxPrice, :sort, 
          :page, :limit, :cursor, :total
        ); END;`,
        {
          keyword: keyword || null,
          category: category || null,
          minPrice: minPrice || 0,
          maxPrice: maxPrice || 999999999,
          sort: sort,
          page: parseInt(page),
          limit: parseInt(limit),
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );
      
      const cursor = result.outBinds.cursor;
    
      // ✅ oracledb v6: set fetchArraySize rồi dùng vòng lặp
      cursor.fetchArraySize = limit;
      
      let products = [];
      let rows;
      while ((rows = await cursor.getRows()) && rows.length > 0) {
        products = products.concat(rows);
      }
      
      await cursor.close();
      
      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: result.outBinds.total,
          totalPages: Math.ceil(result.outBinds.total / limit)
        }
      });
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      res.status(500).json({ success: false, message: "Lỗi server!" });
    } finally {
      if (connection) await connection.close();
    }
  }
};

module.exports = productController;
