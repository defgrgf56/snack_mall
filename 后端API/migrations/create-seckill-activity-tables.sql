-- 创建秒杀活动表
CREATE TABLE IF NOT EXISTS `seckills` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `title` VARCHAR(255) NOT NULL COMMENT '秒杀标题',
  `seckill_price` DECIMAL(10, 2) NOT NULL COMMENT '秒杀价格',
  `original_price` DECIMAL(10, 2) NOT NULL COMMENT '原价',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '秒杀库存',
  `sold` INT NOT NULL DEFAULT 0 COMMENT '已售数量',
  `limit_per_user` INT DEFAULT 1 COMMENT '每人限购数量',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-已结束 1-进行中 2-未开始',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX idx_status_time (`status`, `start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀活动表';

-- 创建活动专区表
CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT '活动标题',
  `subtitle` VARCHAR(255) COMMENT '活动副标题',
  `cover` VARCHAR(500) NOT NULL COMMENT '活动封面图',
  `type` VARCHAR(50) NOT NULL COMMENT '活动类型：festival-节日促销 newbie-新人专享 vip-会员专区 group-拼团活动',
  `description` TEXT COMMENT '活动描述',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-已结束 1-进行中 2-未开始',
  `link_type` TINYINT DEFAULT 1 COMMENT '链接类型：1-商品列表 2-外部链接 3-活动页面',
  `link_value` TEXT COMMENT '链接值',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_time (`status`, `start_time`, `end_time`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动专区表';

-- 创建活动商品关联表
CREATE TABLE IF NOT EXISTS `activity_products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `activity_id` INT NOT NULL COMMENT '活动ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `discount` DECIMAL(5, 2) COMMENT '折扣（如8.5表示8.5折）',
  `special_price` DECIMAL(10, 2) COMMENT '活动价格',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_activity_product` (`activity_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动商品关联表';

-- 创建用户领券记录表（扩展现有优惠券功能）
CREATE TABLE IF NOT EXISTS `user_coupon_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `coupon_id` BIGINT UNSIGNED NOT NULL COMMENT '优惠券ID',
  `user_coupon_id` INT COMMENT '用户优惠券ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作：receive-领取 use-使用 expire-过期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE CASCADE,
  INDEX idx_user_action (`user_id`, `action`),
  INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户领券记录表';
