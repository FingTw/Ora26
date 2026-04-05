-- =========================================================
-- FILE: NS_FUNCTIONS_PACKAGES.sql
-- MỤC ĐÍCH: Tập hợp các đối tượng Function, Sequence và Package
--           mới đề xuất cho hệ thống ShopMall Nông Sản
-- STATUS: Chờ duyệt - chưa thay đổi các file hiện có
-- =========================================================


-- =========================================================
-- PHẦN 1: SEQUENCE
-- =========================================================

-- Sequence sinh mã đơn hàng thân thiện (đọc được, không phải số nguyên thô)
-- Kết hợp với Trigger để tạo MAHD dạng: 20260001, 20260002...
-- (năm hiện tại + 4 số thứ tự, bắt đầu từ 0001)
CREATE SEQUENCE SEQ_MAHD
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
/


-- =========================================================
-- PHẦN 2: FUNCTIONS
-- =========================================================

-- Function 1: Tính tổng doanh thu của 1 Cửa Hàng (chỉ đơn HOÀN THÀNH)
-- Dùng cho: Dashboard của Chủ Shop, Báo cáo Admin
CREATE OR REPLACE FUNCTION FN_DOANHTHU_CUAHANG(
    p_mach IN NUMBER
) RETURN NUMBER IS
    v_doanhthu NUMBER := 0;
BEGIN
    SELECT NVL(SUM(ct.SOLUONG * ct.DONGIALUCMUA), 0)
    INTO v_doanhthu
    FROM CTHD ct
    JOIN SANPHAM sp ON ct.MASP = sp.MASP
    JOIN HOADON hd ON ct.MAHD = hd.MAHD
    WHERE sp.MACH = p_mach
      AND hd.TRANGTHAI = 'HOÀN THÀNH';
    RETURN v_doanhthu;
EXCEPTION
    WHEN OTHERS THEN RETURN 0;
END FN_DOANHTHU_CUAHANG;
/

-- Function 2: Tính tổng tiền hiện tại của Giỏ Hàng theo MATK
-- Dùng cho: Hiển thị realtime tổng giỏ hàng mà không cần JOIN nhiều bảng
CREATE OR REPLACE FUNCTION FN_TINH_TONGTIEN_GIO(
    p_matk IN NUMBER
) RETURN NUMBER IS
    v_total NUMBER := 0;
    v_magh NUMBER;
BEGIN
    SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;
    SELECT NVL(SUM(ct.SOLUONG * sp.DONGIA), 0)
    INTO v_total
    FROM CTGH ct
    JOIN SANPHAM sp ON ct.MASP = sp.MASP
    WHERE ct.MAGH = v_magh;
    RETURN v_total;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 0;
    WHEN OTHERS THEN RETURN 0;
END FN_TINH_TONGTIEN_GIO;
/

-- Function 3: Đếm số đơn hàng theo trạng thái của 1 Cửa Hàng
-- Dùng cho: Badge thống kê trên Dashboard Shop (vd: "3 đơn chờ xác nhận")
CREATE OR REPLACE FUNCTION FN_SL_DONHANG_SHOP(
    p_mach      IN NUMBER,
    p_trangthai IN NVARCHAR2
) RETURN NUMBER IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(DISTINCT hd.MAHD)
    INTO v_count
    FROM HOADON hd
    JOIN CTHD ct ON hd.MAHD = ct.MAHD
    JOIN SANPHAM sp ON ct.MASP = sp.MASP
    WHERE sp.MACH = p_mach
      AND hd.TRANGTHAI = p_trangthai;
    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN RETURN 0;
END FN_SL_DONHANG_SHOP;
/


-- =========================================================
-- PHẦN 3: PACKAGES
-- =========================================================

-- ---------------------------------------------------------
-- PACKAGE 1: PKG_DONHANG
-- Gom toàn bộ logic liên quan đến Đơn Hàng vào 1 package
-- Giúp namespace rõ ràng, gọi: PKG_DONHANG.CHOT_DON(...)
-- ---------------------------------------------------------
CREATE OR REPLACE PACKAGE PKG_DONHANG AS
    -- Chốt đơn hàng (tách đơn theo cửa hàng)
    PROCEDURE CHOT_DON(
        p_matk       IN NUMBER,
        p_mapttt     IN NUMBER,
        p_diachigiao IN NVARCHAR2,
        p_danhsach_sp IN VARCHAR2,
        p_mahd       OUT NUMBER
    );

    -- Hủy đơn hàng (hoàn kho qua Trigger)
    PROCEDURE HUY_DON(
        p_mahd IN NUMBER,
        p_matk IN NUMBER
    );

    -- Cập nhật trạng thái đơn (dành cho Seller)
    PROCEDURE CAP_NHAT_TRANGTHAI(
        p_mahd       IN NUMBER,
        p_trangthai  IN NVARCHAR2,
        p_matk_shop  IN NUMBER
    );

    -- Lấy tổng doanh thu đơn hoàn thành của 1 shop
    FUNCTION DOANHTHU_SHOP(p_mach IN NUMBER) RETURN NUMBER;
END PKG_DONHANG;
/

CREATE OR REPLACE PACKAGE BODY PKG_DONHANG AS

    PROCEDURE CHOT_DON(
        p_matk IN NUMBER, p_mapttt IN NUMBER, p_diachigiao IN NVARCHAR2,
        p_danhsach_sp IN VARCHAR2, p_mahd OUT NUMBER
    ) IS
    BEGIN
        -- Ủy thác cho Procedure SP_CHOT_DON_HANG đã có
        SP_CHOT_DON_HANG(p_matk, p_mapttt, p_diachigiao, p_danhsach_sp, p_mahd);
    END CHOT_DON;

    PROCEDURE HUY_DON(p_mahd IN NUMBER, p_matk IN NUMBER) IS
    BEGIN
        SP_HUY_DONHANG(p_mahd, p_matk);
    END HUY_DON;

    PROCEDURE CAP_NHAT_TRANGTHAI(p_mahd IN NUMBER, p_trangthai IN NVARCHAR2, p_matk_shop IN NUMBER) IS
    BEGIN
        SP_CAPNHAT_TRANGTHAI_HD(p_mahd, p_trangthai, p_matk_shop);
    END CAP_NHAT_TRANGTHAI;

    FUNCTION DOANHTHU_SHOP(p_mach IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN FN_DOANHTHU_CUAHANG(p_mach);
    END DOANHTHU_SHOP;

END PKG_DONHANG;
/


-- ---------------------------------------------------------
-- PACKAGE 2: PKG_CUAHANG
-- Gom toàn bộ logic liên quan đến Cửa Hàng và Sản Phẩm
-- ---------------------------------------------------------
CREATE OR REPLACE PACKAGE PKG_CUAHANG AS
    -- Mở cửa hàng mới
    PROCEDURE MO_CUAHANG(
        p_matk   IN NUMBER,
        p_tench  IN NVARCHAR2,
        p_diachi IN NVARCHAR2
    );

    -- Đăng bán sản phẩm
    PROCEDURE DANG_SANPHAM(
        p_matk      IN NUMBER,
        p_tensp     IN NVARCHAR2,
        p_mota      IN NVARCHAR2,
        p_dongia    IN NUMBER,
        p_soluong   IN NUMBER,
        p_hinhanh   IN VARCHAR2,
        p_maloai    IN NUMBER
    );

    -- Lấy doanh thu cửa hàng
    FUNCTION GET_DOANHTHU(p_mach IN NUMBER) RETURN NUMBER;

    -- Đếm đơn hàng theo trạng thái
    FUNCTION DEM_DON(p_mach IN NUMBER, p_trangthai IN NVARCHAR2) RETURN NUMBER;
END PKG_CUAHANG;
/

CREATE OR REPLACE PACKAGE BODY PKG_CUAHANG AS

    PROCEDURE MO_CUAHANG(p_matk IN NUMBER, p_tench IN NVARCHAR2, p_diachi IN NVARCHAR2) IS
    BEGIN
        SP_MO_CUAHANG(p_matk, p_tench, p_diachi);
    END MO_CUAHANG;

    PROCEDURE DANG_SANPHAM(p_matk IN NUMBER, p_tensp IN NVARCHAR2, p_mota IN NVARCHAR2,
        p_dongia IN NUMBER, p_soluong IN NUMBER, p_hinhanh IN VARCHAR2, p_maloai IN NUMBER) IS
    BEGIN
        SP_DANG_SANPHAM(p_matk, p_tensp, p_mota, p_dongia, p_soluong, p_hinhanh, p_maloai);
    END DANG_SANPHAM;

    FUNCTION GET_DOANHTHU(p_mach IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN FN_DOANHTHU_CUAHANG(p_mach);
    END GET_DOANHTHU;

    FUNCTION DEM_DON(p_mach IN NUMBER, p_trangthai IN NVARCHAR2) RETURN NUMBER IS
    BEGIN
        RETURN FN_SL_DONHANG_SHOP(p_mach, p_trangthai);
    END DEM_DON;

END PKG_CUAHANG;
/


-- ---------------------------------------------------------
-- PACKAGE 3: PKG_BAOCAO
-- Gom các hàm/truy vấn phân tích dữ liệu cho Admin
-- ---------------------------------------------------------
CREATE OR REPLACE PACKAGE PKG_BAOCAO AS
    -- Lấy danh sách Top N cửa hàng theo doanh thu
    PROCEDURE TOP_CUAHANG_DOANHTHU(
        p_top    IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    );

    -- Thống kê số lượng đơn theo từng trạng thái
    PROCEDURE THONGKE_TRANGTHAI_DON(
        p_cursor OUT SYS_REFCURSOR
    );

    -- Thống kê sản phẩm theo danh mục
    PROCEDURE THONGKE_SP_THEO_DANHMUC(
        p_cursor OUT SYS_REFCURSOR
    );

    -- Tổng doanh thu toàn hệ thống (chỉ đơn hoàn thành)
    FUNCTION TONG_DOANHTHU_HT RETURN NUMBER;
END PKG_BAOCAO;
/

CREATE OR REPLACE PACKAGE BODY PKG_BAOCAO AS

    PROCEDURE TOP_CUAHANG_DOANHTHU(p_top IN NUMBER, p_cursor OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT ch.TENCH, FN_DOANHTHU_CUAHANG(ch.MACH) AS DOANHTHU
            FROM CUAHANG ch
            ORDER BY DOANHTHU DESC
            FETCH FIRST p_top ROWS ONLY;
    END TOP_CUAHANG_DOANHTHU;

    PROCEDURE THONGKE_TRANGTHAI_DON(p_cursor OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT TRANGTHAI, COUNT(*) AS SOLUONG
            FROM HOADON
            GROUP BY TRANGTHAI
            ORDER BY SOLUONG DESC;
    END THONGKE_TRANGTHAI_DON;

    PROCEDURE THONGKE_SP_THEO_DANHMUC(p_cursor OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT l.TENLOAI, COUNT(sp.MASP) AS SOLUONG_SP
            FROM SANPHAM sp
            JOIN LOAISP l ON sp.MALOAI = l.MALOAI
            GROUP BY l.TENLOAI
            ORDER BY SOLUONG_SP DESC;
    END THONGKE_SP_THEO_DANHMUC;

    FUNCTION TONG_DOANHTHU_HT RETURN NUMBER IS
        v_total NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(TONGTIEN), 0) INTO v_total
        FROM HOADON
        WHERE TRANGTHAI = 'HOÀN THÀNH';
        RETURN v_total;
    END TONG_DOANHTHU_HT;

END PKG_BAOCAO;
/
