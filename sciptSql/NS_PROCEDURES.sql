-- Thủ tục 1: Đăng ký tài khoản (Tự gán quyền Khách hàng - Role 2)
CREATE OR REPLACE PROCEDURE SP_DANGKY_TAIKHOAN(
    p_email IN VARCHAR2,
    p_matkhau IN VARCHAR2,
    p_hoten IN NVARCHAR2,
    p_sdt IN VARCHAR2
) IS
BEGIN
    INSERT INTO TAIKHOAN (EMAIL, MATKHAU, HOTEN, SDT, MAVAITRO) 
    VALUES (p_email, p_matkhau, p_hoten, p_sdt, 2);
    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'Email này đã được đăng ký!');
END;
/

-- Thủ tục 4: CHỐT ĐƠN HÀNG (Checkout Transaction)
CREATE OR REPLACE PROCEDURE SP_CHOT_DON_HANG(
    p_matk IN NUMBER,
    p_mapttt IN NUMBER,
    p_diachigiao IN NVARCHAR2,
    p_danhsach_sp IN VARCHAR2, -- MỚI: Nhận chuỗi chứa các MASP (vd: '1,3,5')
    p_mahd OUT NUMBER
) IS
    v_magh NUMBER;
    v_count NUMBER;
    v_new_mahd NUMBER;
    v_total_shop_tien NUMBER;
BEGIN
    -- 1. Lấy mã giỏ hàng của tài khoản
    SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;

    IF p_danhsach_sp IS NULL OR LENGTH(p_danhsach_sp) = 0 THEN
        RAISE_APPLICATION_ERROR(-20015, 'Chưa chọn sản phẩm nào để thanh toán!');
    END IF;

    -- Kiểm tra xem chuỗi có hợp lệ không
    SELECT COUNT(*) INTO v_count FROM DUAL WHERE p_danhsach_sp IS NOT NULL;
    
    -- 2. Duyệt qua TỪNG cửa hàng có sản phẩm trong giỏ được chọn
    FOR shop_rec IN (
        SELECT DISTINCT sp.MACH
        FROM CTGH ct
        JOIN SANPHAM sp ON ct.MASP = sp.MASP
        WHERE ct.MAGH = v_magh
          AND ct.MASP IN (
              SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
              FROM DUAL
              CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
          )
    ) LOOP
        -- Tổng tiền cho Cửa hàng này
        SELECT NVL(SUM(ct.SOLUONG * sp.DONGIA), 0) INTO v_total_shop_tien
        FROM CTGH ct JOIN SANPHAM sp ON ct.MASP = sp.MASP
        WHERE ct.MAGH = v_magh
          AND sp.MACH = shop_rec.MACH
          AND ct.MASP IN (
              SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
              FROM DUAL
              CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
          );
          
        -- Tạo hóa đơn riêng cho Cửa hàng này
        INSERT INTO HOADON (MATK, MAPTTT, TONGTIEN, DIACHIGIAO)
        VALUES (p_matk, p_mapttt, v_total_shop_tien, p_diachigiao)
        RETURNING MAHD INTO v_new_mahd;
        
        -- Ghi nhận MAHD ra ngoài (Mã cuối cùng)
        p_mahd := v_new_mahd;

        -- Chuyển hàng từ Giỏ sang Chi tiết hóa đơn (CHỈ CỦA CỬA HÀNG NÀY)
        -- Lưu ý: Trigger TRG_GIAM_TONKHO_DAT_HANG sẽ tự động trừ kho ở bước này!
        INSERT INTO CTHD (MAHD, MASP, SOLUONG, DONGIALUCMUA)
        SELECT v_new_mahd, ct.MASP, ct.SOLUONG, sp.DONGIA
        FROM CTGH ct JOIN SANPHAM sp ON ct.MASP = sp.MASP
        WHERE ct.MAGH = v_magh
          AND sp.MACH = shop_rec.MACH
          AND ct.MASP IN (
              SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
              FROM DUAL
              CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
          );
    END LOOP;

    -- 3. Xóa các món đã mua khỏi giỏ hàng
    DELETE FROM CTGH 
    WHERE MAGH = v_magh 
      AND MASP IN (
          SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
          FROM DUAL
          CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
      );

    -- 4. Cập nhật lại thời gian giỏ hàng
    UPDATE GIOHANG SET NGAYCAPNHAT = SYSTIMESTAMP WHERE MAGH = v_magh;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, 'Không tìm thấy giỏ hàng của tài khoản này!');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20005, 'Lỗi chốt đơn: ' || SQLERRM);
END;
/

-- Hủy đơn hàng và hoàn số lượng tồn kho
CREATE OR REPLACE PROCEDURE SP_HUY_DONHANG(
    p_mahd IN NUMBER,
    p_matk IN NUMBER
) IS
    v_trangthai NVARCHAR2(50);
BEGIN
    -- Lấy trạng thái của hóa đơn để kiểm tra
    BEGIN
        SELECT TRANGTHAI INTO v_trangthai 
        FROM HOADON 
        WHERE MAHD = p_mahd AND MATK = p_matk;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20006, 'Đơn hàng không tồn tại hoặc bạn không có quyền hủy!');
    END;

    -- Chỉ cho phép hủy nếu đơn hàng đang ở trạng thái Cần duyệt hoặc Đang chờ xử lý
    IF v_trangthai = 'CHỜ XÁC NHẬN' OR v_trangthai = 'ĐANG XỬ LÝ' THEN
        -- Đổi trạng thái Hóa đơn thành đã hủy.
        -- Lưu ý: Trigger TRG_HOAN_TONKHO_HUYDON sẽ tự động lắng nghe và hoàn cộng Tồn Kho!
        UPDATE HOADON 
        SET TRANGTHAI = 'ĐÃ HỦY' 
        WHERE MAHD = p_mahd;
        
        COMMIT;
    ELSE
        -- Nếu là ĐANG GIAO hoặc HOÀN THÀNH thì không cho hủy
        RAISE_APPLICATION_ERROR(-20006, 'Không thể hủy đơn hàng đã được giao hoặc hoàn thành!');
    END IF;
END;
/

------đăng ký mở cửa hàng----
CREATE OR REPLACE PROCEDURE SP_MO_CUAHANG(
    p_matk IN NUMBER,
    p_tench IN NVARCHAR2,
    p_diachi IN NVARCHAR2
) IS
    v_count NUMBER;
BEGIN
    -- 1. Kiểm tra xem tài khoản đã có cửa hàng chưa (Ràng buộc 1-1)
    SELECT COUNT(*) INTO v_count FROM CUAHANG WHERE MATK = p_matk;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20009, 'Tài khoản này đã sở hữu một cửa hàng!');
    END IF;

    -- 2. Thêm cửa hàng mới
    INSERT INTO CUAHANG (TENCH, DIACHI, MATK) 
    VALUES (p_tench, p_diachi, p_matk);

    -- 3. Cập nhật quyền của User từ Khách hàng (2) lên Người bán (3)
    UPDATE TAIKHOAN SET MAVAITRO = 3 WHERE MATK = p_matk;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        -- Nếu bắt dính lỗi hệ thống
        IF SQLCODE != -20009 THEN 
            RAISE_APPLICATION_ERROR(-20010, 'Lỗi khi mở cửa hàng: ' || SQLERRM);
        ELSE 
            RAISE; -- Giữ nguyên lỗi -20009 ở trên
        END IF;
END;
/


CREATE OR REPLACE PROCEDURE SP_THEM_VAO_GIO(
    p_matk IN NUMBER,   -- Nhận vào Mã Tài Khoản
    p_masp IN NUMBER,   -- Mã Sản Phẩm
    p_soluong IN NUMBER -- Số lượng
) IS
    v_magh NUMBER;
BEGIN
    -- 1. Kiểm tra xem khách hàng này đã có giỏ hàng chưa?
    BEGIN
        SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            -- 2. Nếu chưa có -> Lập tức tạo một giỏ hàng mới tinh cho khách
            -- Dùng RETURNING để lấy ngay Mã Giỏ Hàng vừa được sinh ra tự động
            INSERT INTO GIOHANG (MATK) VALUES (p_matk) RETURNING MAGH INTO v_magh;
    END;

    -- 3. Đưa món hàng vào Chi tiết giỏ (Có thì cộng dồn, chưa có thì thêm mới)
    MERGE INTO CTGH ct
    USING (SELECT v_magh AS MAGH, p_masp AS MASP, p_soluong AS SOLUONG FROM DUAL) src
    ON (ct.MAGH = src.MAGH AND ct.MASP = src.MASP)
    WHEN MATCHED THEN
        UPDATE SET ct.SOLUONG = ct.SOLUONG + src.SOLUONG
    WHEN NOT MATCHED THEN
        INSERT (MAGH, MASP, SOLUONG) VALUES (src.MAGH, src.MASP, src.SOLUONG);
        
    -- 4. Cập nhật lại ngày update giỏ hàng (Không cần dùng Trigger cập nhật thời gian nữa)
    UPDATE GIOHANG SET NGAYCAPNHAT = SYSTIMESTAMP WHERE MAGH = v_magh;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20008, 'Lỗi khi thêm vào giỏ: ' || SQLERRM);
END;
/



-----Đăng bán Sản phẩm mới-----
CREATE OR REPLACE PROCEDURE SP_DANG_SANPHAM(
    p_matk IN NUMBER,       -- Đầu vào là Mã người dùng đang thao tác
    p_tensp IN NVARCHAR2,
    p_mota IN NVARCHAR2,
    p_dongia IN NUMBER,
    p_soluongton IN NUMBER,
    p_hinhanh IN VARCHAR2,
    p_maloai IN NUMBER
) IS
    v_mach NUMBER;
BEGIN
    -- 1. Tìm mã cửa hàng của tài khoản này
    BEGIN
        SELECT MACH INTO v_mach FROM CUAHANG WHERE MATK = p_matk;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20011, 'Bạn chưa có cửa hàng, không thể đăng bán sản phẩm!');
    END;

    -- 2. Đăng sản phẩm mới gắn liền với Mã cửa hàng vừa tìm được
    INSERT INTO SANPHAM (TENSP, MOTA, DONGIA, SOLUONGTON, HINHANH, MALOAI, MACH)
    VALUES (p_tensp, p_mota, p_dongia, p_soluongton, p_hinhanh, p_maloai, v_mach);

    COMMIT;
END;
/


----cập nhật giỏ hàng-------
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_GIOHANG (
    p_matk IN NUMBER,
    p_masp IN NUMBER,
    p_soluong_moi IN NUMBER
) IS
    v_magh NUMBER;
    v_count NUMBER;
    v_current_soluong NUMBER;
    v_soluongton NUMBER;
    v_tensp NVARCHAR2(255);
BEGIN
    -- 1. Lấy MAGH từ MATK
    SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;
    
    -- 2. Kiểm tra số lượng tồn kho của sản phẩm
    SELECT SOLUONGTON, TENSP INTO v_soluongton, v_tensp
    FROM SANPHAM 
    WHERE MASP = p_masp;
    
    -- 3. Kiểm tra sản phẩm có trong giỏ không và lấy số lượng hiện tại
    SELECT COUNT(*), NVL(MAX(SOLUONG), 0) INTO v_count, v_current_soluong
    FROM CTGH 
    WHERE MAGH = v_magh AND MASP = p_masp;
    
    -- 4. Kiểm tra số lượng mới có vượt quá tồn kho không
    IF p_soluong_moi > v_soluongton THEN
        RAISE_APPLICATION_ERROR(-20005, 
            'Sản phẩm "' || v_tensp || '" chỉ còn ' || v_soluongton || 
            ' sản phẩm trong kho! Bạn không thể mua quá số lượng tồn.');
    END IF;
    
    -- 5. Xử lý theo số lượng mới
    IF p_soluong_moi <= 0 THEN
        -- Không cho phép set số lượng <= 0 trực tiếp
        RAISE_APPLICATION_ERROR(-20003, 
            'Không thể set số lượng <= 0. Vui lòng sử dụng chức năng xóa sản phẩm!');
        
    ELSIF p_soluong_moi = 1 THEN
        -- Cho phép set số lượng = 1
        IF v_count > 0 THEN
            UPDATE CTGH 
            SET SOLUONG = 1 
            WHERE MAGH = v_magh AND MASP = p_masp;
            DBMS_OUTPUT.PUT_LINE('Đã cập nhật số lượng sản phẩm ' || p_masp || ' thành 1');
        ELSE
            INSERT INTO CTGH (MAGH, MASP, SOLUONG) 
            VALUES (v_magh, p_masp, 1);
            DBMS_OUTPUT.PUT_LINE('Đã thêm mới sản phẩm ' || p_masp || ' vào giỏ hàng với số lượng 1');
        END IF;
        
    ELSIF p_soluong_moi > 1 THEN
        -- Kiểm tra lại lần nữa trước khi cập nhật
        IF p_soluong_moi > v_soluongton THEN
            RAISE_APPLICATION_ERROR(-20005, 
                'Sản phẩm "' || v_tensp || '" chỉ còn ' || v_soluongton || 
                ' sản phẩm trong kho! Bạn chỉ có thể mua tối đa ' || v_soluongton || ' sản phẩm.');
        END IF;
        
        -- Cho phép tăng số lượng lên > 1
        IF v_count > 0 THEN
            UPDATE CTGH 
            SET SOLUONG = p_soluong_moi 
            WHERE MAGH = v_magh AND MASP = p_masp;
            DBMS_OUTPUT.PUT_LINE('Đã cập nhật số lượng sản phẩm ' || p_masp || ' thành ' || p_soluong_moi);
        ELSE
            INSERT INTO CTGH (MAGH, MASP, SOLUONG) 
            VALUES (v_magh, p_masp, p_soluong_moi);
            DBMS_OUTPUT.PUT_LINE('Đã thêm mới sản phẩm ' || p_masp || ' vào giỏ hàng với số lượng ' || p_soluong_moi);
        END IF;
    END IF;
-- 6. Cập nhật thời gian giỏ hàng
    UPDATE GIOHANG 
    SET NGAYCAPNHAT = SYSTIMESTAMP 
    WHERE MAGH = v_magh;
    
    -- 7. Commit transaction
    COMMIT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'Không tìm thấy giỏ hàng của user ' || p_matk);
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'Lỗi cập nhật giỏ hàng: ' || SQLERRM);
END SP_CAPNHAT_GIOHANG;
/


------------------admin------
CREATE OR REPLACE PROCEDURE SP_ADMIN_THEM_TAIKHOAN(
    p_email IN VARCHAR2,
    p_matkhau IN VARCHAR2,
    p_hoten IN NVARCHAR2,
    p_sdt IN VARCHAR2,
    p_mavaitro IN NUMBER
) IS
BEGIN
    INSERT INTO TAIKHOAN (EMAIL, MATKHAU, HOTEN, SDT, MAVAITRO) 
    VALUES (p_email, p_matkhau, p_hoten, p_sdt, p_mavaitro);
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE SP_ADMIN_SUA_TAIKHOAN(
    p_matk IN NUMBER,
    p_hoten IN NVARCHAR2,
    p_sdt IN VARCHAR2,
    p_mavaitro IN NUMBER
) IS
BEGIN
    UPDATE TAIKHOAN 
    SET HOTEN = p_hoten, SDT = p_sdt, MAVAITRO = p_mavaitro
    WHERE MATK = p_matk;
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE SP_ADMIN_XOA_TAIKHOAN(
    p_matk IN NUMBER
) IS
BEGIN
    DELETE FROM TAIKHOAN WHERE MATK = p_matk;
    COMMIT;
END;
/

-- CRUD LOAISP (Danh mục)
CREATE OR REPLACE PROCEDURE SP_ADMIN_THEM_LOAISP(
    p_tenloai IN NVARCHAR2
) IS
BEGIN
    INSERT INTO LOAISP (TENLOAI) VALUES (p_tenloai);
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE SP_ADMIN_SUA_LOAISP(
    p_maloai IN NUMBER,
    p_tenloai IN NVARCHAR2
) IS
BEGIN
    UPDATE LOAISP SET TENLOAI = p_tenloai WHERE MALOAI = p_maloai;
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE SP_ADMIN_XOA_LOAISP(
    p_maloai IN NUMBER
) IS
BEGIN
    DELETE FROM LOAISP WHERE MALOAI = p_maloai;
    COMMIT;
END;
/


-- Quản lý CUAHANG
CREATE OR REPLACE PROCEDURE SP_ADMIN_SUA_CUAHANG(
    p_mach IN NUMBER,
    p_trangthai IN NVARCHAR2
) IS
BEGIN
    UPDATE CUAHANG SET TRANGTHAI = p_trangthai WHERE MACH = p_mach;
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE SP_ADMIN_XOA_CUAHANG(
    p_mach IN NUMBER
) IS
BEGIN
    DELETE FROM CUAHANG WHERE MACH = p_mach;
    COMMIT;
END;



-----------phân trang------------
CREATE OR REPLACE PROCEDURE SP_LAY_SP_PHAN_TRANG (
    p_trang IN NUMBER,           -- Trang hiện tại (1, 2, 3...)
    p_soluong_mot_trang IN NUMBER, -- Số sản phẩm mỗi trang (VD: 12, 20, 24)
    p_cursor OUT SYS_REFCURSOR,
    p_tongso OUT NUMBER          -- Tổng số sản phẩm (để biết có bao nhiêu trang)
) IS
    v_start NUMBER;
    v_end NUMBER;
BEGIN
    -- Tính toán vị trí bắt đầu và kết thúc
    v_start := (p_trang - 1) * p_soluong_mot_trang + 1;
    v_end := p_trang * p_soluong_mot_trang;
    
    -- Đếm tổng số sản phẩm đang hoạt động
    SELECT COUNT(*) INTO p_tongso 
    FROM V_CHITIET_SANPHAM_WEB;
    
    -- Lấy dữ liệu phân trang bằng ROWNUM
    OPEN p_cursor FOR
        SELECT * FROM (
            SELECT a.*, ROWNUM rnum 
            FROM (
                SELECT * FROM V_CHITIET_SANPHAM_WEB
                ORDER BY MASP DESC  -- Sản phẩm mới nhất lên đầu
            ) a 
            WHERE ROWNUM <= v_end
        ) 
        WHERE rnum >= v_start;
END SP_LAY_SP_PHAN_TRANG;
/

-- Lấy sản phẩm theo danh mục có phân trang
CREATE OR REPLACE PROCEDURE SP_SP_THEO_LOAI_PHANTRANG (
    p_maloai IN NUMBER,
    p_trang IN NUMBER,
    p_soluong_mot_trang IN NUMBER,
    p_cursor OUT SYS_REFCURSOR,
    p_tongso OUT NUMBER
) IS
    v_start NUMBER;
    v_end NUMBER;
BEGIN
    v_start := (p_trang - 1) * p_soluong_mot_trang + 1;
    v_end := p_trang * p_soluong_mot_trang;
    
    -- Đếm tổng số sản phẩm trong danh mục
    SELECT COUNT(*) INTO p_tongso 
    FROM V_CHITIET_SANPHAM_WEB
    WHERE MALOAI = p_maloai;
    
    -- Lấy dữ liệu phân trang
    OPEN p_cursor FOR
        SELECT * FROM (
            SELECT a.*, ROWNUM rnum 
            FROM (
                SELECT * FROM V_CHITIET_SANPHAM_WEB
                WHERE MALOAI = p_maloai
                ORDER BY MASP DESC
            ) a 
            WHERE ROWNUM <= v_end
        ) 
        WHERE rnum >= v_start;
END SP_SP_THEO_LOAI_PHANTRANG;
/

-- Tìm kiếm sản phẩm với nhiều tiêu chí + phân trang
CREATE OR REPLACE PROCEDURE SP_TIMKIEM_PHANTRANG (
    p_tukhoa         IN NVARCHAR2 DEFAULT NULL,
    p_maloai         IN NUMBER    DEFAULT NULL,
    p_gia_min        IN NUMBER    DEFAULT 0,
    p_gia_max        IN NUMBER    DEFAULT 999999999,
    p_sapxep         IN VARCHAR2  DEFAULT 'moi_nhat',
    p_trang          IN NUMBER    DEFAULT 1,
    p_soluong_mot_trang IN NUMBER DEFAULT 12, 
    p_cursor         OUT SYS_REFCURSOR,
    p_tongso         OUT NUMBER
) IS
    v_start   NUMBER;
    v_end     NUMBER;
    v_orderby VARCHAR2(100);
    v_where   VARCHAR2(500);
BEGIN
    v_start := (p_trang - 1) * p_soluong_mot_trang + 1;
    v_end   := p_trang * p_soluong_mot_trang;

    -- Xác định cách sắp xếp
    IF    p_sapxep = 'gia_tang' THEN v_orderby := 'ORDER BY DONGIA ASC';
    ELSIF p_sapxep = 'gia_giam' THEN v_orderby := 'ORDER BY DONGIA DESC';
    ELSIF p_sapxep = 'ten_az'   THEN v_orderby := 'ORDER BY TENSP ASC';
    ELSIF p_sapxep = 'ten_za'   THEN v_orderby := 'ORDER BY TENSP DESC';
    ELSE                             v_orderby := 'ORDER BY MASP DESC';
    END IF;

    -- ✅ Điều kiện WHERE dùng :placeholder, KHÔNG dùng tên biến PL/SQL
    v_where := 'WHERE (:p_tukhoa IS NULL OR UPPER(TENSP) LIKE ''%'' || UPPER(:p_tukhoa) || ''%'')
                  AND (:p_maloai IS NULL OR MALOAI = :p_maloai)
                  AND DONGIA BETWEEN :p_gia_min AND :p_gia_max';

    -- Đếm tổng số
    EXECUTE IMMEDIATE
        'SELECT COUNT(*) FROM V_CHITIET_SANPHAM_WEB ' || v_where
    INTO p_tongso
    USING p_tukhoa, p_tukhoa, p_maloai, p_maloai, p_gia_min, p_gia_max;
    --   ↑ tukhoa truyền 2 lần vì xuất hiện 2 lần trong v_where (:p_tukhoa IS NULL và UPPER(:p_tukhoa))

    -- Lấy dữ liệu phân trang
    OPEN p_cursor FOR
        'SELECT * FROM (
            SELECT a.*, ROWNUM rnum FROM (
                SELECT * FROM V_CHITIET_SANPHAM_WEB
                ' || v_where || '
                ' || v_orderby || '
            ) a WHERE ROWNUM <= :v_end
        ) WHERE rnum >= :v_start'
    USING p_tukhoa, p_tukhoa, p_maloai, p_maloai, p_gia_min, p_gia_max, v_end, v_start;

END SP_TIMKIEM_PHANTRANG;
/

---lấy thông tin cửa hàng---
CREATE OR REPLACE PROCEDURE SP_LAY_THONGTIN_CUAHANG(
    p_matk IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) IS
BEGIN
    OPEN p_cursor FOR
        SELECT MACH, TENCH, DIACHI, TRANGTHAI, MATK 
        FROM CUAHANG 
        WHERE MATK = p_matk;
END;
/



-- ---Procedure lấy thông tin cửa hàng theo Mã tài khoản
CREATE OR REPLACE PROCEDURE SP_LAY_THONGTIN_CUAHANG(
    p_matk IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) IS
BEGIN
    OPEN p_cursor FOR
        SELECT MACH, TENCH, DIACHI, TRANGTHAI, MATK 
        FROM CUAHANG 
        WHERE MATK = p_matk;
END;
/


-- 1. Lấy danh sách sản phẩm của riêng 1 cửa hàng thao tác qua chủ shop (MATK)
CREATE OR REPLACE PROCEDURE SP_LAY_SANPHAM_CUAHANG(
    p_matk IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
) IS
BEGIN
    OPEN p_cursor FOR
        SELECT sp.*, ls.TENLOAI 
        FROM SANPHAM sp
        JOIN LOAISP ls ON sp.MALOAI = ls.MALOAI
        WHERE sp.MACH = (SELECT MACH FROM CUAHANG WHERE MATK = p_matk)
        ORDER BY sp.MASP DESC;
END;
/

-- 2. Cập nhật (Sửa) thông tin sản phẩm
CREATE OR REPLACE PROCEDURE SP_SUA_SANPHAM(
    p_matk IN NUMBER,
    p_masp IN NUMBER,
    p_tensp IN NVARCHAR2,
    p_mota IN NVARCHAR2,
    p_dongia IN NUMBER,
    p_soluongton IN NUMBER,
    p_maloai IN NUMBER,
    p_hinhanh IN VARCHAR2 -- Nhận chuỗi rỗng nếu không thay đổi ảnh
) IS
    v_mach NUMBER;
BEGIN
    -- Kiểm tra chủ cửa hàng đúng với mã hay ko
    SELECT MACH INTO v_mach FROM CUAHANG WHERE MATK = p_matk;

    IF p_hinhanh IS NOT NULL AND p_hinhanh != '' THEN
        UPDATE SANPHAM 
        SET TENSP = p_tensp, MOTA = p_mota, DONGIA = p_dongia, 
            SOLUONGTON = p_soluongton, MALOAI = p_maloai, HINHANH = p_hinhanh
        WHERE MASP = p_masp AND MACH = v_mach;
    ELSE
        -- Nếu không up ảnh mới thì giữ nguyên ảnh cũ
        UPDATE SANPHAM 
        SET TENSP = p_tensp, MOTA = p_mota, DONGIA = p_dongia, 
            SOLUONGTON = p_soluongton, MALOAI = p_maloai
        WHERE MASP = p_masp AND MACH = v_mach;
    END IF;
    COMMIT;
END;
/

-- 3. Xoá sản phẩm
CREATE OR REPLACE PROCEDURE SP_XOA_SANPHAM(
    p_matk IN NUMBER,
    p_masp IN NUMBER
) IS
    v_mach NUMBER;
BEGIN
    SELECT MACH INTO v_mach FROM CUAHANG WHERE MATK = p_matk;
    DELETE FROM SANPHAM WHERE MASP = p_masp AND MACH = v_mach;
    COMMIT;
END;
/

