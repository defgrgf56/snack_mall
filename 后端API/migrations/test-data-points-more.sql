-- 积分系统扩展测试数据
SET NAMES utf8mb4;

-- 1. 增加更多积分商品
INSERT INTO `points_products` (`name`, `cover`, `images`, `description`, `points`, `stock`, `exchange_count`, `limit_per_user`, `status`, `sort`) VALUES
('小米充电宝', 'https://example.com/powerbank.jpg', '["https://example.com/pb1.jpg"]', '20000毫安大容量快充充电宝', 1200, 25, 5, 1, 1, 85),
('运动手环', 'https://example.com/band.jpg', '["https://example.com/band1.jpg"]', '智能运动手环，心率监测', 2000, 15, 2, 1, 1, 95),
('50元优惠券', 'https://example.com/coupon50.jpg', '[]', '全场通用50元优惠券', 500, 200, 68, 3, 1, 75),
('品牌鼠标垫', 'https://example.com/mousepad.jpg', '["https://example.com/mp1.jpg"]', '超大游戏鼠标垫，防滑设计', 300, 80, 25, 5, 1, 65),
('精美书签套装', 'https://example.com/bookmark.jpg', '["https://example.com/bm1.jpg"]', '10张精美书签，金属材质', 150, 100, 42, NULL, 1, 55),
('便携雨伞', 'https://example.com/umbrella.jpg', '["https://example.com/ub1.jpg"]', '自动开合晴雨两用伞', 600, 40, 18, 2, 1, 50);

-- 2. 增加更多抽奖活动和奖品
INSERT INTO `lottery_activities` (`name`, `cover`, `description`, `points_per_draw`, `start_time`, `end_time`, `daily_limit`, `total_limit`, `status`) VALUES
('周年庆超级抽奖', 'https://example.com/anniversary.jpg', '周年庆特惠，仅需50积分！', 50, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 10, NULL, 1),
('新用户专享抽奖', 'https://example.com/newuser.jpg', '新用户专属福利，首次免费抽奖', 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 1, 1);

-- 为第2个活动添加奖品
INSERT INTO `lottery_prizes` (`activity_id`, `name`, `image`, `type`, `value`, `probability`, `stock`, `sort`) VALUES
(2, '30积分', 'https://example.com/points30.jpg', 1, '30', 25.00, NULL, 100),
(2, '80积分', 'https://example.com/points80.jpg', 1, '80', 15.00, NULL, 90),
(2, '150积分', 'https://example.com/points150.jpg', 1, '150', 8.00, NULL, 80),
(2, '5元优惠券', 'https://example.com/coupon5.jpg', 2, '1', 20.00, 100, 70),
(2, '15元优惠券', 'https://example.com/coupon15.jpg', 2, '2', 10.00, 50, 60),
(2, '实物小礼品', 'https://example.com/gift.jpg', 3, '精美钥匙扣', 2.00, 20, 50),
(2, '谢谢参与', 'https://example.com/thanks.jpg', 4, NULL, 20.00, NULL, 40);

-- 为第3个活动添加奖品
INSERT INTO `lottery_prizes` (`activity_id`, `name`, `image`, `type`, `value`, `probability`, `stock`, `sort`) VALUES
(3, '20积分', 'https://example.com/points20.jpg', 1, '20', 30.00, NULL, 100),
(3, '50积分', 'https://example.com/points50.jpg', 1, '50', 25.00, NULL, 90),
(3, '100积分', 'https://example.com/points100.jpg', 1, '100', 15.00, NULL, 80),
(3, '优惠券礼包', 'https://example.com/coupon-pack.jpg', 2, '3', 18.00, 30, 70),
(3, '实物奖品', 'https://example.com/prize.jpg', 3, '精美礼品', 1.00, 10, 60),
(3, '再接再厉', 'https://example.com/tryagain.jpg', 4, NULL, 11.00, NULL, 50);

SELECT '扩展测试数据插入成功！' as message;
