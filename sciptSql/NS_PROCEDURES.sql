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
    v_tongtien NUMBER := 0;
BEGIN
    -- 1. Lấy mã giỏ hàng của tài khoản
    SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;

    IF p_danhsach_sp IS NULL OR LENGTH(p_danhsach_sp) = 0 THEN
        RAISE_APPLICATION_ERROR(-20015, 'Chưa chọn sản phẩm nào để thanh toán!');
    END IF;

    -- 2. Tính tổng tiền (CHỈ TÍNH CÁC MÓN ĐƯỢC CHỌN)
    SELECT NVL(SUM(ct.SOLUONG * sp.DONGIA), 0) INTO v_tongtien
    FROM CTGH ct JOIN SANPHAM sp ON ct.MASP = sp.MASP
    WHERE ct.MAGH = v_magh
      AND ct.MASP IN (
          -- Kỹ thuật tách chuỗi '1,3,5' thành các dòng: 1, 3, 5
          SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
          FROM DUAL
          CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
      );

    IF v_tongtien = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Các sản phẩm chọn mua không hợp lệ hoặc không có trong giỏ!');
    END IF;

    -- 3. Tạo hóa đơn
    INSERT INTO HOADON (MATK, MAPTTT, TONGTIEN, DIACHIGIAO)
    VALUES (p_matk, p_mapttt, v_tongtien, p_diachigiao)
    RETURNING MAHD INTO p_mahd;

    -- 4. Chuyển hàng từ Giỏ sang Chi tiết hóa đơn (CHỈ CHUYỂN MÓN ĐƯỢC CHỌN)
    INSERT INTO CTHD (MAHD, MASP, SOLUONG, DONGIALUCMUA)
    SELECT p_mahd, ct.MASP, ct.SOLUONG, sp.DONGIA
    FROM CTGH ct JOIN SANPHAM sp ON ct.MASP = sp.MASP
    WHERE ct.MAGH = v_magh
      AND ct.MASP IN (
          SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
          FROM DUAL
          CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
      );
    
    -- 5. Trừ tồn kho trong bảng SANPHAM (CHỈ TRỪ MÓN ĐƯỢC CHỌN)
    FOR rec IN (
        SELECT ct.MASP, ct.SOLUONG 
        FROM CTGH ct 
        WHERE ct.MAGH = v_magh
          AND ct.MASP IN (
              SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
              FROM DUAL
              CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
          )
    ) LOOP
        UPDATE SANPHAM 
        SET SOLUONGTON = SOLUONGTON - rec.SOLUONG 
        WHERE MASP = rec.MASP;
    END LOOP;

    -- 6. CHỈ XÓA các món đã mua khỏi giỏ hàng (Các món chưa mua vẫn ở lại)
    DELETE FROM CTGH 
    WHERE MAGH = v_magh 
      AND MASP IN (
          SELECT TO_NUMBER(REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL))
          FROM DUAL
          CONNECT BY REGEXP_SUBSTR(p_danhsach_sp, '[^,]+', 1, LEVEL) IS NOT NULL
      );

    -- Cập nhật lại thời gian giỏ hàng
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


