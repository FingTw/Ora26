
-- Đảm bảo tồn kho luôn chính xác
CREATE OR REPLACE TRIGGER TRG_HOAN_TONKHO_HUYDON
AFTER UPDATE OF TRANGTHAI ON HOADON
FOR EACH ROW
WHEN (NEW.TRANGTHAI = 'ĐÃ HỦY' AND OLD.TRANGTHAI != 'ĐÃ HỦY')
BEGIN
    FOR rec IN (SELECT MASP, SOLUONG FROM CTHD WHERE MAHD = :NEW.MAHD) LOOP
        UPDATE SANPHAM 
        SET SOLUONGTON = SOLUONGTON + rec.SOLUONG 
        WHERE MASP = rec.MASP;
    END LOOP;
END;
/
-- Trigger: Tự động TRỪ TỒN KHO khi có Hóa đơn Sinh Mới (CTHD được thêm)
CREATE OR REPLACE TRIGGER TRG_GIAM_TONKHO_DAT_HANG
AFTER INSERT ON CTHD
FOR EACH ROW
BEGIN
    UPDATE SANPHAM 
    SET SOLUONGTON = SOLUONGTON - :NEW.SOLUONG 
    WHERE MASP = :NEW.MASP;
END;
/

-----Ngăn tự mua hàng của chính mình----
CREATE OR REPLACE TRIGGER TRG_CHAN_MUA_HANG_NHA
BEFORE INSERT OR UPDATE ON CTGH
FOR EACH ROW
DECLARE
    v_matk_mua NUMBER;
    v_matk_ban NUMBER;
BEGIN
    -- 1. Tìm xem ai đang sở hữu Giỏ hàng này (Người mua)
    SELECT MATK INTO v_matk_mua 
    FROM GIOHANG 
    WHERE MAGH = :NEW.MAGH;

    -- 2. Tìm xem ai là chủ của Sản phẩm này (Người bán)
    SELECT ch.MATK INTO v_matk_ban
    FROM SANPHAM sp
    JOIN CUAHANG ch ON sp.MACH = ch.MACH
    WHERE sp.MASP = :NEW.MASP;

    -- 3. So sánh: Nếu trùng nhau thì văng lỗi (Kick out!)
    IF v_matk_mua = v_matk_ban THEN
        RAISE_APPLICATION_ERROR(-20012, 'Phát hiện gian lận: Bạn không thể tự mua sản phẩm do chính cửa hàng mình bán!');
    END IF;
END;
/