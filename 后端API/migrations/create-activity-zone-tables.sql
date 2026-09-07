-- 创建活动专区表
CREATE TABLE IF NOT EXISTS activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL COMMENT '活动标题',
  subtitle VARCHAR(255) NOT NULL COMMENT '活动副标题',
  cover VARCHAR(500) NOT NULL COMMENT '活动封面图',
  type VARCHAR(20) NOT NULL DEFAULT 'festival' COMMENT '活动类型: festival节日促销, newbie新人专享, vip会员专区, group拼团活动',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME NOT NULL COMMENT '结束时间',
  status TINYINT NOT NULL DEFAULT 2 COMMENT '状态: 0已结束, 1进行中, 2未开始',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序值，数字越大越靠前',
  description TEXT COMMENT '活动描述',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_time (start_time, end_time),
  INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动专区表';

-- 创建活动商品关联表
CREATE TABLE IF NOT EXISTS activity_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  activity_id INT NOT NULL COMMENT '活动ID',
  product_id BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  discount DECIMAL(3,1) DEFAULT 10.0 COMMENT '折扣，单位：折（如8.5折）',
  special_price DECIMAL(10,2) COMMENT '特价，设置后折扣失效',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序值，数字越大越靠前',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_activity_product (activity_id, product_id),
  INDEX idx_activity (activity_id),
  INDEX idx_product (product_id),
  INDEX idx_sort (sort),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动商品关联表';