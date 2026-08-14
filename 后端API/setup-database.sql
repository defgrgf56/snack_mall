-- 数据库配置脚本
-- 使用方法：mysql -u root -p < setup-database.sql

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS snack_mall 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE snack_mall;

-- 3. 显示创建结果
SELECT '数据库创建成功！' AS message;
SHOW DATABASES LIKE 'snack_mall';
