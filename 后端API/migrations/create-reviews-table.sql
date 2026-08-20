-- 创建评价表和评价图片表

-- 1. 评价表
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `order_item_id` BIGINT UNSIGNED NOT NULL COMMENT '订单商品ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `rating` TINYINT NOT NULL DEFAULT 5 COMMENT '评分（1-5星）',
  `content` TEXT COMMENT '评价内容',
  `is_anonymous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否匿名（0-否 1-是）',
  `reply_content` TEXT COMMENT '商家回复内容',
  `reply_time` DATETIME COMMENT '商家回复时间',
  `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `is_show` TINYINT NOT NULL DEFAULT 1 COMMENT '是否显示（0-隐藏 1-显示）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0-待审核 1-已通过 2-已拒绝）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';

-- 2. 评价图片表
CREATE TABLE IF NOT EXISTS `review_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `review_id` BIGINT UNSIGNED NOT NULL COMMENT '评价ID',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_review_id` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价图片表';

-- 3. 为订单商品表添加评价状态字段（忽略错误如果字段已存在）
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'snack_mall' 
  AND TABLE_NAME = 'order_items' 
  AND COLUMN_NAME = 'is_reviewed');

SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE `order_items` ADD COLUMN `is_reviewed` TINYINT NOT NULL DEFAULT 0 COMMENT "是否已评价（0-未评价 1-已评价）" AFTER `total_amount`', 
  'SELECT "字段is_reviewed已存在" as message');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '评价表创建成功！' as message;
