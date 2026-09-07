-- 活动专区测试数据

-- 插入测试活动
INSERT INTO activities (title, subtitle, cover, type, start_time, end_time, status, sort, description) VALUES
('春节年货节', '新年好礼买贵必赔', 'https://picsum.photos/750/400?random=1', 'festival', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 1, 100, '春节年货大促销，精选零食全场折扣'),
('新人专享', '新用户专属优惠', 'https://picsum.photos/750/400?random=2', 'newbie', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 24 DAY), 1, 90, '新用户注册即享超值折扣'),
('会员专区', 'VIP尊享特权', 'https://picsum.photos/750/400?random=3', 'vip', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 26 DAY), 1, 80, '会员专属商品，尊享折扣'),
('元宵节促销', '正月十五闹元宵', 'https://picsum.photos/750/400?random=4', 'festival', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY), 2, 70, '元宵佳节，甜蜜优惠'),
('拼团活动', '3人成团享优惠', 'https://picsum.photos/750/400?random=5', 'group', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 0, 60, '邀请好友一起拼团，享受超值优惠');

-- 为每个活动添加商品（假设商品ID 1-20存在）
-- 春节年货节商品
INSERT INTO activity_products (activity_id, product_id, discount, sort) VALUES
(1, 1, 8.5, 100),
(1, 2, 9.0, 90),
(1, 3, 7.5, 80),
(1, 5, 8.0, 70),
(1, 7, 8.5, 60);

-- 新人专享商品
INSERT INTO activity_products (activity_id, product_id, discount, sort) VALUES
(2, 4, 6.0, 100),
(2, 6, 5.5, 90),
(2, 8, 6.5, 80),
(2, 10, 7.0, 70);

-- 会员专区商品
INSERT INTO activity_products (activity_id, product_id, special_price, sort) VALUES
(3, 11, 99.00, 100),
(3, 12, 89.00, 90),
(3, 13, 79.00, 80),
(3, 14, 69.00, 70);

-- 元宵节促销商品
INSERT INTO activity_products (activity_id, product_id, discount, sort) VALUES
(4, 15, 8.8, 100),
(4, 16, 8.0, 90),
(4, 17, 7.5, 80);

-- 拼团活动商品
INSERT INTO activity_products (activity_id, product_id, special_price, sort) VALUES
(5, 18, 39.90, 100),
(5, 19, 29.90, 90),
(5, 20, 19.90, 80);