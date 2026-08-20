-- 创建搜索相关表

-- 1. 搜索历史表
CREATE TABLE IF NOT EXISTS `search_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `keyword` VARCHAR(100) NOT NULL COMMENT '搜索关键词',
  `search_count` INT NOT NULL DEFAULT 1 COMMENT '搜索次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_keyword` (`keyword`),
  INDEX `idx_updated_at` (`updated_at`),
  UNIQUE KEY `uk_user_keyword` (`user_id`, `keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索历史表';

-- 2. 热门搜索表
CREATE TABLE IF NOT EXISTS `search_hot` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `keyword` VARCHAR(100) NOT NULL COMMENT '搜索关键词',
  `search_count` INT NOT NULL DEFAULT 0 COMMENT '搜索次数',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序（数字越大越靠前）',
  `is_show` TINYINT NOT NULL DEFAULT 1 COMMENT '是否显示（0-隐藏 1-显示）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_keyword` (`keyword`),
  INDEX `idx_search_count` (`search_count`),
  INDEX `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='热门搜索表';

SELECT '搜索表创建成功！' as message;
