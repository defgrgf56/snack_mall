-- 重置优惠券领取限制和记录

-- 1. 增加每人领取限制（方便测试）
UPDATE coupons SET per_limit = 100;

-- 2. 清空所有用户的优惠券领取记录（可选，如果要重新测试）
-- DELETE FROM user_coupons;

-- 3. 重置优惠券领取数量
UPDATE coupons SET receive_count = 0;

SELECT '优惠券限制已重置' as message;
SELECT id, name, per_limit, total_count, receive_count FROM coupons LIMIT 10;
