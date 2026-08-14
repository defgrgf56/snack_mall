-- ============================================
-- 测试数据脚本
-- 使用方法：mysql -u root -p snack_mall < test-data.sql
-- ============================================

USE snack_mall;

-- 插入管理员账号（密码都是：123456）
INSERT INTO `admins` (`username`, `password`, `real_name`, `phone`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EH4pc3zF2bH2G1F3H5lLSa', 'Super Admin', '13800138000', 'admin@example.com', 'super_admin', 1),
('manager', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EH4pc3zF2bH2G1F3H5lLSa', 'Manager', '13800138001', 'manager@example.com', 'admin', 1);

-- 插入商品分类
INSERT INTO `categories` (`name`, `icon`, `sort`, `status`) VALUES
('Nuts', 'https://img.yzcdn.cn/vant/cat.jpeg', 1, 1),
('Candy', 'https://img.yzcdn.cn/vant/cat.jpeg', 2, 1),
('Cookies', 'https://img.yzcdn.cn/vant/cat.jpeg', 3, 1),
('Jerky', 'https://img.yzcdn.cn/vant/cat.jpeg', 4, 1),
('Dried Fruit', 'https://img.yzcdn.cn/vant/cat.jpeg', 5, 1),
('Snacks', 'https://img.yzcdn.cn/vant/cat.jpeg', 6, 1);

-- 插入商品（坚果类）
INSERT INTO `products` (`category_id`, `name`, `description`, `image`, `images`, `price`, `original_price`, `stock`, `sales`, `status`) VALUES
(1, 'Daily Nuts Mix 500g', 'Selected premium nuts, nutritious and delicious', 'https://img.yzcdn.cn/vant/apple-1.jpg', 'https://img.yzcdn.cn/vant/apple-1.jpg,https://img.yzcdn.cn/vant/apple-2.jpg', 29.90, 39.90, 500, 1234, 1),
(1, 'Macadamia Nuts 500g', 'Creamy and rich flavor', 'https://img.yzcdn.cn/vant/apple-2.jpg', 'https://img.yzcdn.cn/vant/apple-2.jpg', 39.90, 49.90, 300, 856, 1),
(1, 'Pecan Nuts 500g', 'Thin shell, easy to peel', 'https://img.yzcdn.cn/vant/apple-3.jpg', 'https://img.yzcdn.cn/vant/apple-3.jpg', 35.90, 45.90, 400, 672, 1),
(1, 'Pistachio Nuts 500g', 'Natural opening, full grains', 'https://img.yzcdn.cn/vant/apple-4.jpg', 'https://img.yzcdn.cn/vant/apple-4.jpg', 45.90, 55.90, 200, 423, 1);

-- 插入商品（糖果类）
INSERT INTO `products` (`category_id`, `name`, `description`, `image`, `price`, `original_price`, `stock`, `sales`, `status`) VALUES
(2, 'Swiss Chocolate Gift Box', 'Smooth and rich taste', 'https://img.yzcdn.cn/vant/apple-1.jpg', 89.90, 129.90, 150, 345, 1),
(2, 'Fruit Gummy Mix', 'Real fruit juice, chewy', 'https://img.yzcdn.cn/vant/apple-2.jpg', 19.90, 29.90, 600, 987, 1);

-- 插入商品（饼干类）
INSERT INTO `products` (`category_id`, `name`, `description`, `image`, `price`, `original_price`, `stock`, `sales`, `status`) VALUES
(3, 'Handmade Cookie Gift Box', 'Handmade with milk flavor', 'https://img.yzcdn.cn/vant/apple-3.jpg', 49.90, 69.90, 250, 567, 1),
(3, 'Wafer Cookies', 'Crispy with multiple flavors', 'https://img.yzcdn.cn/vant/apple-4.jpg', 15.90, 22.90, 800, 1234, 1);

-- 插入轮播图
INSERT INTO `banners` (`title`, `image`, `link_type`, `link_value`, `sort`, `status`) VALUES
('New Arrivals', 'https://img.yzcdn.cn/vant/banner-1.jpg', 'product', '1', 1, 1),
('Limited Offers', 'https://img.yzcdn.cn/vant/banner-2.jpg', 'category', '1', 2, 1),
('Member Exclusive', 'https://img.yzcdn.cn/vant/banner-3.jpg', 'page', '/pages/coupon-list/coupon-list', 3, 1);

-- 插入优惠券
INSERT INTO `coupons` (`name`, `type`, `discount_type`, `discount_amount`, `discount_rate`, `min_amount`, `total_quantity`, `received_quantity`, `per_user_limit`, `start_time`, `end_time`, `status`) VALUES
('New User Coupon', 1, 1, 10.00, NULL, 50.00, 1000, 123, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('20 off 100', 2, 1, 20.00, NULL, 100.00, 5000, 567, 3, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('20% Off Coupon', 2, 2, NULL, 0.80, 0.00, 2000, 234, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1);

-- 提示信息
SELECT 'Test data imported successfully!' AS message;
SELECT 'Data Statistics:' AS '';
SELECT CONCAT('Admins: ', COUNT(*), ' records') AS info FROM admins;
SELECT CONCAT('Categories: ', COUNT(*), ' records') AS info FROM categories;
SELECT CONCAT('Products: ', COUNT(*), ' records') AS info FROM products;
SELECT CONCAT('Banners: ', COUNT(*), ' records') AS info FROM banners;
SELECT CONCAT('Coupons: ', COUNT(*), ' records') AS info FROM coupons;
SELECT '' AS '';
SELECT 'Admin Login Info:' AS '';
SELECT 'Username: admin, Password: 123456' AS info;
SELECT 'Username: manager, Password: 123456' AS info;
