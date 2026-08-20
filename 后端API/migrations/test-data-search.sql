-- 搜索功能测试数据
SET NAMES utf8mb4;

-- 清空表
TRUNCATE TABLE `search_hot`;
TRUNCATE TABLE `search_history`;

-- 插入热门搜索词
INSERT INTO `search_hot` (`keyword`, `search_count`, `sort`, `is_show`) VALUES
('坚果零食', 1580, 100, 1),
('巧克力', 1350, 90, 1),
('饼干糕点', 980, 80, 1),
('膨化食品', 850, 70, 1),
('糖果', 720, 60, 1),
('果冻布丁', 650, 50, 1),
('肉干肉脯', 580, 40, 1),
('蜜饯果干', 520, 30, 1),
('海味即食', 450, 20, 1),
('零食大礼包', 890, 10, 1);

SELECT '热门搜索测试数据插入成功！' as message;
SELECT COUNT(*) as hot_count FROM `search_hot`;
