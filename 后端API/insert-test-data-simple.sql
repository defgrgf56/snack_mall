USE snack_mall;

-- 清空现有测试数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE admins;
TRUNCATE TABLE categories;
TRUNCATE TABLE products;
TRUNCATE TABLE banners;
TRUNCATE TABLE coupons;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入管理员（密码：123456）
INSERT INTO admins (username, password, real_name, phone, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EH4pc3zF2bH2G1F3H5lLSa', 'Admin', '13800138000', 'admin@example.com', 'super_admin', 1),
('manager', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EH4pc3zF2bH2G1F3H5lLSa', 'Manager', '13800138001', 'manager@example.com', 'admin', 1);

-- 插入分类
INSERT INTO categories (name, icon, sort, status) VALUES
('Nuts', 'https://img.yzcdn.cn/vant/cat.jpeg', 1, 1),
('Candy', 'https://img.yzcdn.cn/vant/cat.jpeg', 2, 1),
('Cookies', 'https://img.yzcdn.cn/vant/cat.jpeg', 3, 1),
('Jerky', 'https://img.yzcdn.cn/vant/cat.jpeg', 4, 1),
('Dried Fruit', 'https://img.yzcdn.cn/vant/cat.jpeg', 5, 1),
('Snacks', 'https://img.yzcdn.cn/vant/cat.jpeg', 6, 1);

-- 插入商品
INSERT INTO products (category_id, name, description, image, images, price, original_price, stock, sales, status) VALUES
(1, 'Daily Nuts Mix 500g', 'Premium nuts', 'https://img.yzcdn.cn/vant/apple-1.jpg', 'https://img.yzcdn.cn/vant/apple-1.jpg', 29.90, 39.90, 500, 1234, 1),
(1, 'Macadamia 500g', 'Creamy flavor', 'https://img.yzcdn.cn/vant/apple-2.jpg', 'https://img.yzcdn.cn/vant/apple-2.jpg', 39.90, 49.90, 300, 856, 1),
(1, 'Pecan 500g', 'Easy to peel', 'https://img.yzcdn.cn/vant/apple-3.jpg', 'https://img.yzcdn.cn/vant/apple-3.jpg', 35.90, 45.90, 400, 672, 1),
(1, 'Pistachio 500g', 'Full grains', 'https://img.yzcdn.cn/vant/apple-4.jpg', 'https://img.yzcdn.cn/vant/apple-4.jpg', 45.90, 55.90, 200, 423, 1),
(2, 'Chocolate Box', 'Rich taste', 'https://img.yzcdn.cn/vant/apple-1.jpg', 'https://img.yzcdn.cn/vant/apple-1.jpg', 89.90, 129.90, 150, 345, 1),
(2, 'Fruit Gummy', 'Real juice', 'https://img.yzcdn.cn/vant/apple-2.jpg', 'https://img.yzcdn.cn/vant/apple-2.jpg', 19.90, 29.90, 600, 987, 1),
(3, 'Cookie Box', 'Handmade', 'https://img.yzcdn.cn/vant/apple-3.jpg', 'https://img.yzcdn.cn/vant/apple-3.jpg', 49.90, 69.90, 250, 567, 1),
(3, 'Wafer Cookies', 'Crispy', 'https://img.yzcdn.cn/vant/apple-4.jpg', 'https://img.yzcdn.cn/vant/apple-4.jpg', 15.90, 22.90, 800, 1234, 1);

-- 插入轮播图
INSERT INTO banners (title, image, link_type, link_value, sort, status) VALUES
('New Arrivals', 'https://img.yzcdn.cn/vant/banner-1.jpg', 'product', '1', 1, 1),
('Hot Sale', 'https://img.yzcdn.cn/vant/banner-2.jpg', 'category', '1', 2, 1),
('Member Only', 'https://img.yzcdn.cn/vant/banner-3.jpg', 'page', '/pages/coupon-list/coupon-list', 3, 1);

-- 插入优惠券
INSERT INTO coupons (name, type, discount_type, discount_amount, discount_rate, min_amount, total_quantity, received_quantity, per_user_limit, start_time, end_time, status) VALUES
('New User', 1, 1, 10.00, NULL, 50.00, 1000, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('20 off 100', 2, 1, 20.00, NULL, 100.00, 5000, 0, 3, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('20% Off', 2, 2, NULL, 0.80, 0.00, 2000, 0, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1);

-- 显示结果
SELECT 'Data imported successfully!' AS Result;
