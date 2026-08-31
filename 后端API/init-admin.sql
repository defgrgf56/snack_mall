-- 初始化管理员账号
-- 删除已存在的admin账号（如果有）
DELETE FROM admins WHERE username = 'admin';

-- 插入默认管理员账号
-- 用户名: admin
-- 密码: admin123
-- 密码哈希使用 bcrypt 生成
INSERT INTO admins (username, password, nickname, role, status, created_at, updated_at)
VALUES (
  'admin',
  '$2b$10$YQ98P.x3Z8Wr8LxCZKLxOeGJ3xGq4hKP8vXMZqh3yBdN5xGKqTLKe',
  '超级管理员',
  1,
  1,
  NOW(),
  NOW()
);

SELECT * FROM admins WHERE username = 'admin';