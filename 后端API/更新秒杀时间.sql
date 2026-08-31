-- 更新秒杀时间为当前时间开始
-- 让秒杀活动持续2小时

UPDATE seckills 
SET 
  start_time = DATE_SUB(NOW(), INTERVAL 10 MINUTE),  -- 10分钟前开始
  end_time = DATE_ADD(NOW(), INTERVAL 2 HOUR),       -- 2小时后结束
  status = 1                                          -- 进行中
WHERE id IN (1, 2, 3, 4, 5);

-- 更新另外5个为即将开始（未来1小时开始）
UPDATE seckills 
SET 
  start_time = DATE_ADD(NOW(), INTERVAL 1 HOUR),     -- 1小时后开始
  end_time = DATE_ADD(NOW(), INTERVAL 3 HOUR),       -- 3小时后结束
  status = 2                                          -- 未开始
WHERE id IN (6, 7, 8, 9, 10);

-- 查看更新结果
SELECT 
  id, 
  title, 
  seckill_price,
  original_price,
  stock,
  sold,
  start_time,
  end_time,
  status,
  CASE 
    WHEN status = 1 THEN '进行中'
    WHEN status = 2 THEN '未开始'
    ELSE '已结束'
  END as status_text
FROM seckills
ORDER BY sort DESC;