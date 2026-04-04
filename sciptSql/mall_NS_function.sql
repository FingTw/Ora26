-- Function: Đếm tổng số lượng món hàng trong giỏ
CREATE OR REPLACE FUNCTION FN_DEM_SL_GIOHANG(
    p_matk IN NUMBER
) RETURN NUMBER IS
    v_count NUMBER := 0;
    v_magh NUMBER;
BEGIN
    BEGIN
        -- 1. Lấy mã giỏ hàng của user
        SELECT MAGH INTO v_magh FROM GIOHANG WHERE MATK = p_matk;
        SELECT NVL(count(MASP), 0) INTO v_count FROM CTGH WHERE MAGH = v_magh;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN 
            -- Nếu khách chưa có giỏ hoặc giỏ trống thì trả về 0
            v_count := 0;
    END;
    RETURN v_count;
END;
/