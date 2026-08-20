-- 积分转赠表
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `points_transfers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `from_user_id` BIGINT UNSIGNED NOT NULL COMMENT '转出用户ID',
  `to_user_id` BIGINT UNSIGNED NOT NULL COMMENT '转入用户ID',
  `points` INT NOT NULL COMMENT '转赠积分数',
  `message` VARCHAR(200) COMMENT '留言',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1-成功 2-已撤回）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_from_user` (`from_user_id`),
  INDEX `idx_to_user` (`to_user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分转赠记录表';

SELECT '积分转赠表创建成功！' as message;
