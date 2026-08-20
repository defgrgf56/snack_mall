-- 创建退款表
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '退款ID',
  `refund_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '退款单号',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `refund_type` TINYINT NOT NULL DEFAULT 1 COMMENT '退款类型: 1-仅退款 2-退货退款',
  `refund_reason` VARCHAR(200) NOT NULL COMMENT '退款原因',
  `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
  `refund_desc` TEXT COMMENT '退款说明',
  `refund_images` JSON COMMENT '退款凭证图片',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待审核 1-审核通过 2-审核拒绝 3-退款中 4-退款成功 5-已取消',
  `reject_reason` VARCHAR(200) COMMENT '拒绝原因',
  `admin_remark` VARCHAR(500) COMMENT '管理员备注',
  `refund_time` TIMESTAMP NULL COMMENT '退款完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_refund_no` (`refund_no`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';

-- 创建退款日志表
CREATE TABLE IF NOT EXISTS `refund_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `refund_id` INT NOT NULL COMMENT '退款ID',
  `status` TINYINT NOT NULL COMMENT '状态',
  `operator` VARCHAR(50) COMMENT '操作人',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_refund_id` (`refund_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款日志表';
