-- ============================================
-- 零食小程序商城 - 清空所有测试数据
-- 执行前请确认数据库备份！
-- ============================================

-- 设置字符集编码
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE `snack_mall`;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 清空所有表数据
TRUNCATE TABLE `order_logs`;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `user_coupons`;
TRUNCATE TABLE `points_logs`;
TRUNCATE TABLE `cart`;
TRUNCATE TABLE `product_images`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `addresses`;
TRUNCATE TABLE `coupons`;
TRUNCATE TABLE `banners`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `admins`;
TRUNCATE TABLE `configs`;

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 重置自增ID
ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `addresses` AUTO_INCREMENT = 1;
ALTER TABLE `categories` AUTO_INCREMENT = 1;
ALTER TABLE `products` AUTO_INCREMENT = 1;
ALTER TABLE `product_images` AUTO_INCREMENT = 1;
ALTER TABLE `cart` AUTO_INCREMENT = 1;
ALTER TABLE `orders` AUTO_INCREMENT = 1;
ALTER TABLE `order_items` AUTO_INCREMENT = 1;
ALTER TABLE `order_logs` AUTO_INCREMENT = 1;
ALTER TABLE `coupons` AUTO_INCREMENT = 1;
ALTER TABLE `user_coupons` AUTO_INCREMENT = 1;
ALTER TABLE `points_logs` AUTO_INCREMENT = 1;
ALTER TABLE `banners` AUTO_INCREMENT = 1;
ALTER TABLE `admins` AUTO_INCREMENT = 1;
ALTER TABLE `configs` AUTO_INCREMENT = 1;

SELECT '数据库清空完成！' AS message;
