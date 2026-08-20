-- 评价测试数据

-- 插入测试评价数据（针对商品ID 1-10）
INSERT INTO `reviews` (`order_id`, `order_item_id`, `user_id`, `product_id`, `rating`, `content`, `is_anonymous`, `reply_content`, `reply_time`, `likes`, `is_show`, `status`, `created_at`, `updated_at`) VALUES
-- 商品1的评价（10条）
(1, 1, 1, 1, 5, '薯片很好吃，味道正宗，包装完好，物流也很快！', 0, '感谢支持，祝您购物愉快！', NOW(), 15, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 2, 1, 5, '非常满意，口感酥脆，分量足，会回购的', 0, NULL, NULL, 8, 1, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 3, 3, 1, 4, '味道不错，就是价格稍微贵了点', 1, '感谢反馈，我们会继续努力提供更优惠的价格', NOW(), 3, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 4, 1, 1, 5, '第三次购买了，一如既往的好吃！强烈推荐', 0, NULL, NULL, 12, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 5, 2, 1, 5, '包装精美，送人也很体面，味道一级棒！', 0, '谢谢亲的五星好评~', NOW(), 6, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 6, 3, 1, 4, '整体还可以，但是有几片碎了', 0, '非常抱歉给您带来不好的体验，我们会加强质检', NOW(), 2, 1, 1, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(7, 7, 1, 1, 5, '孩子超级喜欢，已经囤了好几箱了', 0, NULL, NULL, 9, 1, 1, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(8, 8, 2, 1, 3, '口味一般般，不是很符合我的口味', 1, NULL, NULL, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(9, 9, 3, 1, 5, '很好吃！！！爱了爱了，会继续支持的', 0, NULL, NULL, 7, 1, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(10, 10, 1, 1, 5, '朋友推荐来买的，果然没让我失望！', 0, NULL, NULL, 4, 1, 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- 商品2的评价（8条）
(11, 11, 1, 2, 5, '洋葱圈很香脆，停不下来！', 0, NULL, NULL, 10, 1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(12, 12, 2, 2, 4, '味道不错，就是有点油', 0, NULL, NULL, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, 13, 3, 2, 5, '超级好吃，比超市便宜多了', 0, '感谢支持~', NOW(), 8, 1, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(14, 14, 1, 2, 5, '孩子的最爱，买了好多次了', 1, NULL, NULL, 6, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(15, 15, 2, 2, 4, '包装很好，没有碎的', 0, NULL, NULL, 3, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(16, 16, 3, 2, 5, '物流很快，东西很新鲜', 0, NULL, NULL, 7, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(17, 17, 1, 2, 3, '不如之前买的好吃了', 1, NULL, NULL, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(18, 18, 2, 2, 5, '好吃！会回购！', 0, NULL, NULL, 4, 1, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- 商品3的评价（5条）
(19, 19, 1, 3, 5, '雪饼很好吃，小时候的味道', 0, NULL, NULL, 9, 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(20, 20, 2, 3, 4, '还可以，就是有点甜', 0, NULL, NULL, 2, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(21, 21, 3, 3, 5, '非常好吃，推荐购买！', 0, '谢谢支持！', NOW(), 11, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(22, 22, 1, 3, 5, '物美价廉，性价比很高', 1, NULL, NULL, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(23, 23, 2, 3, 4, '味道还不错，会再买', 0, NULL, NULL, 3, 1, 1, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- 插入评价图片（晒单）
INSERT INTO `review_images` (`review_id`, `image_url`, `sort`) VALUES
-- 为第1条评价添加图片
(1, 'https://picsum.photos/400/400?random=201', 0),
(1, 'https://picsum.photos/400/400?random=202', 1),
(1, 'https://picsum.photos/400/400?random=203', 2),

-- 为第2条评价添加图片
(2, 'https://picsum.photos/400/400?random=204', 0),
(2, 'https://picsum.photos/400/400?random=205', 1),

-- 为第4条评价添加图片
(4, 'https://picsum.photos/400/400?random=206', 0),

-- 为第5条评价添加图片
(5, 'https://picsum.photos/400/400?random=207', 0),
(5, 'https://picsum.photos/400/400?random=208', 1),
(5, 'https://picsum.photos/400/400?random=209', 2),
(5, 'https://picsum.photos/400/400?random=210', 3),

-- 为第11条评价添加图片
(11, 'https://picsum.photos/400/400?random=211', 0),
(11, 'https://picsum.photos/400/400?random=212', 1),

-- 为第13条评价添加图片
(13, 'https://picsum.photos/400/400?random=213', 0),
(13, 'https://picsum.photos/400/400?random=214', 1),
(13, 'https://picsum.photos/400/400?random=215', 2),

-- 为第19条评价添加图片
(19, 'https://picsum.photos/400/400?random=216', 0),
(19, 'https://picsum.photos/400/400?random=217', 1),

-- 为第21条评价添加图片
(21, 'https://picsum.photos/400/400?random=218', 0),
(21, 'https://picsum.photos/400/400?random=219', 1),
(21, 'https://picsum.photos/400/400?random=220', 2);

SELECT '评价测试数据导入成功！' as message;
SELECT 
  '商品ID' as label, 
  product_id, 
  COUNT(*) as '评价数',
  AVG(rating) as '平均评分',
  SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as '好评数'
FROM reviews 
GROUP BY product_id 
ORDER BY product_id;
