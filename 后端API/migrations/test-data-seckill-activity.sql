-- 插入秒杀活动测试数据
-- 注意：需要先确保products表中有对应的商品数据

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 清空现有数据
TRUNCATE TABLE seckills;
TRUNCATE TABLE activities;
TRUNCATE TABLE activity_products;

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 插入秒杀活动（使用现有商品ID 1-10）
INSERT INTO `seckills` (`product_id`, `title`, `seckill_price`, `original_price`, `stock`, `sold`, `limit_per_user`, `start_time`, `end_time`, `status`, `sort`) VALUES
(1, '限时秒杀 - 乐事薯片原味', 6.90, 10.90, 100, 45, 2, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 100),
(2, '限时秒杀 - 奥利奥饼干', 8.50, 15.90, 80, 62, 2, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 99),
(3, '限时秒杀 - 德芙巧克力', 18.80, 32.90, 50, 38, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 98),
(4, '限时秒杀 - 旺旺雪饼', 5.90, 9.90, 120, 88, 3, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 97),
(5, '限时秒杀 - 三只松鼠坚果', 22.90, 39.90, 60, 42, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 96),
(6, '限时秒杀 - 卫龙辣条', 4.50, 8.90, 200, 156, 5, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 95),
(7, '限时秒杀 - 好丽友派', 12.90, 21.90, 90, 67, 2, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 94),
(8, '限时秒杀 - 旺仔牛奶', 28.80, 45.90, 70, 51, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 93),
(9, '限时秒杀 - 可比克薯片', 7.90, 13.90, 110, 78, 3, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 92),
(10, '限时秒杀 - 徐福记糖果', 15.90, 28.90, 85, 59, 2, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 91);

-- 插入活动专区数据
INSERT INTO `activities` (`title`, `subtitle`, `cover`, `type`, `description`, `start_time`, `end_time`, `status`, `link_type`, `link_value`, `sort`) VALUES
-- 节日促销
('双十一狂欢节', '全场5折起 满199减100', 'https://picsum.photos/400/300?random=1', 'festival', '双十一全场大促销，所有商品5折起，满199减100，满299减150，满399减200！', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1, '', 100),

-- 新人专享
('新人专享礼包', '新用户领取专属优惠', 'https://picsum.photos/400/300?random=2', 'newbie', '新用户注册即送50元优惠券大礼包，首单立减20元！', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 1, '', 99),

-- 会员专区
('会员日特惠', 'VIP会员专享8折', 'https://picsum.photos/400/300?random=3', 'vip', '每月会员日，VIP会员专享8折优惠，更有会员专属商品限时抢购！', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 1, 1, '', 98),

-- 拼团活动
('三人拼团享优惠', '邀请好友一起拼', 'https://picsum.photos/400/300?random=4', 'group', '邀请2位好友一起拼团，享受超低拼团价！热门商品低至3折！', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 1, '', 97);

-- 为活动添加关联商品（活动ID 1-4，商品ID 1-20）
-- 双十一狂欢节的商品（商品ID 1-5）
INSERT INTO `activity_products` (`activity_id`, `product_id`, `discount`, `special_price`, `sort`) VALUES
(1, 1, 5.0, NULL, 10),  -- 5折
(1, 2, 6.0, NULL, 9),   -- 6折
(1, 3, 5.5, NULL, 8),   -- 5.5折
(1, 4, 6.5, NULL, 7),   -- 6.5折
(1, 5, 5.0, NULL, 6);   -- 5折

-- 新人专享的商品（商品ID 6-10）
INSERT INTO `activity_products` (`activity_id`, `product_id`, `discount`, `special_price`, `sort`) VALUES
(2, 6, NULL, 9.90, 10),   -- 特价9.90
(2, 7, NULL, 19.90, 9),   -- 特价19.90
(2, 8, NULL, 29.90, 8),   -- 特价29.90
(2, 9, NULL, 39.90, 7),   -- 特价39.90
(2, 10, NULL, 49.90, 6);   -- 特价49.90

-- 会员专区的商品（商品ID 11-15）
INSERT INTO `activity_products` (`activity_id`, `product_id`, `discount`, `special_price`, `sort`) VALUES
(3, 11, 8.0, NULL, 10),  -- 8折
(3, 12, 8.0, NULL, 9),   -- 8折
(3, 13, 8.0, NULL, 8),   -- 8折
(3, 14, 8.0, NULL, 7),   -- 8折
(3, 15, 8.0, NULL, 6);   -- 8折

-- 拼团活动的商品（商品ID 16-20）
INSERT INTO `activity_products` (`activity_id`, `product_id`, `discount`, `special_price`, `sort`) VALUES
(4, 16, 3.0, NULL, 10),  -- 3折
(4, 17, 3.5, NULL, 9),   -- 3.5折
(4, 18, 4.0, NULL, 8),   -- 4折
(4, 19, 3.0, NULL, 7),   -- 3折
(4, 20, 3.5, NULL, 6);   -- 3.5折

-- 为优惠券表添加一些测试数据（如果优惠券表为空）
INSERT INTO `coupons` (`name`, `type`, `discount_type`, `discount_value`, `min_amount`, `total_count`, `receive_count`, `per_limit`, `start_time`, `end_time`, `status`) VALUES
('新人专享券', 1, 1, 20.00, 0.00, 1000, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('满100减10', 1, 1, 10.00, 100.00, 500, 0, 3, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1),
('满200减30', 1, 1, 30.00, 200.00, 300, 0, 2, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1),
('9折优惠券', 1, 2, 9.00, 50.00, 200, 0, 5, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1),
('满300减50', 1, 1, 50.00, 300.00, 100, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY), 1);

-- 查看插入结果
SELECT '秒杀活动数据:' as '';
SELECT id, product_id, title, seckill_price, original_price, stock, sold, status FROM seckills;

SELECT '活动专区数据:' as '';
SELECT id, title, subtitle, type, status FROM activities;

SELECT '活动商品关联数据:' as '';
SELECT ap.id, a.title as activity_name, ap.product_id, ap.discount, ap.special_price 
FROM activity_products ap 
LEFT JOIN activities a ON ap.activity_id = a.id;

SELECT '优惠券数据:' as '';
SELECT id, name, discount_type, discount_value, min_amount, status FROM coupons;
