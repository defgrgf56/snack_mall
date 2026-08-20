-- 积分系统测试数据
SET NAMES utf8mb4;

-- 1. 插入积分商品
INSERT INTO `points_products` (`name`, `cover`, `images`, `description`, `points`, `stock`, `exchange_count`, `limit_per_user`, `status`, `sort`) VALUES
('三只松鼠大礼包', 'https://example.com/snack-gift.jpg', '["https://example.com/snack1.jpg","https://example.com/snack2.jpg"]', '精选坚果零食大礼包，多种口味任你选', 1000, 50, 12, 2, 1, 100),
('优质保温杯', 'https://example.com/cup.jpg', '["https://example.com/cup1.jpg"]', '304不锈钢保温杯，保温保冷24小时', 800, 30, 8, 1, 1, 90),
('无线蓝牙耳机', 'https://example.com/earphone.jpg', '["https://example.com/earphone1.jpg"]', '高音质无线蓝牙耳机，降噪设计', 1500, 20, 3, 1, 1, 80),
('10元优惠券', 'https://example.com/coupon.jpg', '[]', '全场通用10元优惠券', 200, 100, 35, 5, 1, 70),
('精美笔记本', 'https://example.com/notebook.jpg', '["https://example.com/notebook1.jpg"]', 'A5精装笔记本，商务办公必备', 500, 50, 15, 3, 1, 60);

-- 2. 插入抽奖活动
INSERT INTO `lottery_activities` (`name`, `cover`, `description`, `points_per_draw`, `start_time`, `end_time`, `daily_limit`, `total_limit`, `status`) VALUES
('新年幸运大转盘', 'https://example.com/lottery.jpg', '新年特惠，100积分抽大奖！', 100, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 5, NULL, 1);

-- 3. 插入抽奖奖品
INSERT INTO `lottery_prizes` (`activity_id`, `name`, `image`, `type`, `value`, `probability`, `stock`, `sort`) VALUES
(1, '50积分', 'https://example.com/points50.jpg', 1, '50', 30.00, NULL, 100),
(1, '100积分', 'https://example.com/points100.jpg', 1, '100', 20.00, NULL, 90),
(1, '200积分', 'https://example.com/points200.jpg', 1, '200', 10.00, NULL, 80),
(1, '10元优惠券', 'https://example.com/coupon10.jpg', 2, '1', 15.00, 50, 70),
(1, '20元优惠券', 'https://example.com/coupon20.jpg', 2, '2', 5.00, 20, 60),
(1, '谢谢参与', 'https://example.com/thanks.jpg', 4, NULL, 20.00, NULL, 50);

-- 4. 插入积分任务
INSERT INTO `points_tasks` (`name`, `description`, `icon`, `type`, `task_key`, `target_count`, `points_reward`, `sort`, `status`) VALUES
('每日签到', '每天签到即可获得积分', '📅', 'daily', 'daily_check_in', 1, 10, 100, 1),
('完成首单', '完成第一笔订单', '🛒', 'once', 'first_order', 1, 100, 90, 1),
('分享商品', '分享商品给好友', '👥', 'daily', 'share_product', 3, 20, 80, 1),
('评价商品', '对已购商品进行评价', '⭐', 'weekly', 'review_product', 5, 50, 70, 1),
('邀请好友', '邀请好友注册', '💝', 'once', 'invite_friend', 1, 200, 60, 1),
('浏览商品', '浏览10个不同商品', '👀', 'daily', 'browse_product', 10, 5, 50, 1),
('加入购物车', '添加商品到购物车', '🛒', 'daily', 'add_to_cart', 5, 15, 40, 1);

SELECT '积分系统测试数据插入成功！' as message;
