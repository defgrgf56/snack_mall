-- 积分系统相关表
SET NAMES utf8mb4;

-- 1. 积分商品表
CREATE TABLE IF NOT EXISTS `points_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `cover` VARCHAR(500) NOT NULL COMMENT '商品封面图',
  `images` TEXT COMMENT '商品图片（JSON数组）',
  `description` TEXT COMMENT '商品描述',
  `points` INT NOT NULL COMMENT '所需积分',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  `exchange_count` INT NOT NULL DEFAULT 0 COMMENT '兑换次数',
  `limit_per_user` INT DEFAULT NULL COMMENT '每人限兑数量（NULL为不限）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0-下架 1-上架）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分商品表';

-- 2. 积分兑换记录表
CREATE TABLE IF NOT EXISTS `points_exchanges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `product_cover` VARCHAR(500) NOT NULL COMMENT '商品封面',
  `points` INT NOT NULL COMMENT '消耗积分',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '兑换数量',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态（0-待发货 1-已发货 2-已完成）',
  `address_id` BIGINT UNSIGNED COMMENT '收货地址ID',
  `express_company` VARCHAR(100) COMMENT '快递公司',
  `express_no` VARCHAR(100) COMMENT '快递单号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分兑换记录表';

-- 3. 抽奖活动表
CREATE TABLE IF NOT EXISTS `lottery_activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL COMMENT '活动名称',
  `cover` VARCHAR(500) COMMENT '活动封面图',
  `description` TEXT COMMENT '活动描述',
  `points_per_draw` INT NOT NULL DEFAULT 100 COMMENT '每次抽奖消耗积分',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `daily_limit` INT DEFAULT NULL COMMENT '每日抽奖次数限制（NULL为不限）',
  `total_limit` INT DEFAULT NULL COMMENT '总抽奖次数限制（NULL为不限）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0-禁用 1-启用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='抽奖活动表';

-- 4. 抽奖奖品表
CREATE TABLE IF NOT EXISTS `lottery_prizes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `activity_id` BIGINT UNSIGNED NOT NULL COMMENT '活动ID',
  `name` VARCHAR(200) NOT NULL COMMENT '奖品名称',
  `image` VARCHAR(500) COMMENT '奖品图片',
  `type` TINYINT NOT NULL COMMENT '类型（1-积分 2-优惠券 3-实物 4-谢谢参与）',
  `value` VARCHAR(200) COMMENT '奖品价值（积分数/优惠券ID/实物描述）',
  `probability` DECIMAL(5,2) NOT NULL COMMENT '中奖概率（百分比，如10.50表示10.5%）',
  `stock` INT DEFAULT NULL COMMENT '库存数量（NULL为不限）',
  `win_count` INT NOT NULL DEFAULT 0 COMMENT '中奖次数',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='抽奖奖品表';

-- 5. 抽奖记录表
CREATE TABLE IF NOT EXISTS `lottery_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `activity_id` BIGINT UNSIGNED NOT NULL COMMENT '活动ID',
  `prize_id` BIGINT UNSIGNED NOT NULL COMMENT '奖品ID',
  `prize_name` VARCHAR(200) NOT NULL COMMENT '奖品名称',
  `prize_type` TINYINT NOT NULL COMMENT '奖品类型',
  `prize_value` VARCHAR(200) COMMENT '奖品价值',
  `points_cost` INT NOT NULL COMMENT '消耗积分',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态（0-未领取 1-已领取）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='抽奖记录表';

-- 6. 签到记录表
CREATE TABLE IF NOT EXISTS `check_in_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `check_date` DATE NOT NULL COMMENT '签到日期',
  `points` INT NOT NULL COMMENT '获得积分',
  `continuous_days` INT NOT NULL DEFAULT 1 COMMENT '连续签到天数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_date` (`user_id`, `check_date`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到记录表';

-- 7. 积分任务表
CREATE TABLE IF NOT EXISTS `points_tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL COMMENT '任务名称',
  `description` TEXT COMMENT '任务描述',
  `icon` VARCHAR(500) COMMENT '任务图标',
  `type` VARCHAR(50) NOT NULL COMMENT '任务类型（daily-每日 weekly-每周 once-一次性）',
  `task_key` VARCHAR(100) NOT NULL COMMENT '任务标识（如：complete_order, share_goods）',
  `target_count` INT NOT NULL DEFAULT 1 COMMENT '目标完成次数',
  `points_reward` INT NOT NULL COMMENT '完成奖励积分',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（0-禁用 1-启用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_task_key` (`task_key`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分任务表';

-- 8. 用户任务进度表
CREATE TABLE IF NOT EXISTS `user_task_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `task_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
  `current_count` INT NOT NULL DEFAULT 0 COMMENT '当前完成次数',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态（0-进行中 1-已完成 2-已领取奖励）',
  `completed_at` DATETIME COMMENT '完成时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_task` (`user_id`, `task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务进度表';

SELECT '积分系统表创建成功！' as message;
