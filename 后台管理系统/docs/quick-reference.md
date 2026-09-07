# 快速问题排查卡片 🚀

## 🔴 问题：无法获取数据

### 快速检查（按顺序执行）

```bash
# 1️⃣ 检查后端服务是否运行
netstat -ano | findstr :3000
# 如果没有输出 → 后端服务未启动

# 2️⃣ 检查前端服务是否运行  
netstat -ano | findstr :8080
# 如果没有输出 → 前端服务未启动

# 3️⃣ 测试后端接口
curl http://localhost:3000/health
# 应该返回 {"status":"ok",...}
```

### 快速修复

```bash
# 启动后端服务
cd 后端API
npm run dev
# 等待看到：服务器运行在 http://localhost:3000

# 启动前端服务  
cd 后台管理系统
npm run dev
# 等待看到：http://localhost:8080
```

---

## 🖼️ 问题：图片无法加载

### 症状
- 商品图片显示为空白
- 分类图标不显示
- 浏览器控制台有404或超时错误

### 原因
- 外部图片服务不稳定（picsum.photos被墙）
- 图片URL失效

### 已执行的修复
✅ 所有图片URL已更新为 `via.placeholder.com`
✅ 前端已添加图片加载失败处理

### 如需重新修复
```bash
# 执行修复SQL
mysql -uroot -p666666 snack_mall < 后端API/migrations/fix-image-urls.sql
```

---

## 🔑 问题：401未授权

### 症状
- 登录后立即提示"登录已过期"
- API请求返回401

### 快速修复
```javascript
// 在浏览器控制台执行
localStorage.clear()
// 然后重新登录
```

---

## 📊 问题：数据库连接失败

### 症状
- 后端启动报错：ECONNREFUSED
- 日志显示数据库连接失败

### 检查
```bash
# 1. 检查MySQL服务
mysql -uroot -p666666 -e "SELECT 1"

# 2. 检查数据库是否存在
mysql -uroot -p666666 -e "SHOW DATABASES LIKE 'snack_mall'"

# 3. 检查.env配置
cat 后端API/.env | grep DB_
```

### 修复
```bash
# 确保MySQL运行
# Windows: 服务管理器中启动MySQL服务
# 或检查数据库密码是否为 666666
```

---

## 🚦 服务状态检查

### 健康检查命令
```bash
# 后端健康检查
curl http://localhost:3000/health

# 前端访问检查
curl http://localhost:8080

# 数据库检查
mysql -uroot -p666666 -e "SELECT 1"
```

### 预期响应
- 后端：`{"status":"ok","timestamp":"...","uptime":...}`
- 前端：返回HTML页面
- 数据库：返回 `1`

---

## 📝 常用端口

| 服务 | 端口 | 地址 |
|------|------|------|
| 后端API | 3000 | http://localhost:3000 |
| 前端管理 | 8080 | http://localhost:8080 |
| MySQL | 3306 | localhost:3306 |

---

## 🔧 常用命令

### 停止占用端口的进程
```powershell
# 1. 查找进程
netstat -ano | findstr :3000

# 2. 停止进程（PID是上一步的最后一列）
Stop-Process -Id <PID> -Force
```

### 查看服务日志
```bash
# 后端日志：查看运行后端的终端输出

# 数据库日志
mysql -uroot -p666666 -e "SHOW VARIABLES LIKE 'log_error'"
```

### 重启所有服务
```bash
# 1. 停止所有Node进程
Get-Process node | Stop-Process -Force

# 2. 重启后端
cd 后端API
npm run dev

# 3. 重启前端（新终端）
cd 后台管理系统  
npm run dev
```

---

## 🎯 快速测试流程

### 1. 登录测试
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 接口测试（需要token）
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/products?page=1&pageSize=10
```

### 3. 公开接口测试（无需token）
```bash
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/products?page=1&pageSize=10
```

---

## 🆘 紧急联系

如果以上方法都无效：

1. **查看详细文档**：
   - `troubleshooting-guide.md` - 完整排查指南
   - `fix-summary.md` - 修复总结报告

2. **收集信息**：
   - 后端终端的完整日志
   - 浏览器Console的错误信息
   - 浏览器Network中失败的请求

3. **重启大法**：
   ```bash
   # 停止所有
   Get-Process node | Stop-Process -Force
   
   # 重启MySQL（如果需要）
   # 在服务管理器中重启MySQL服务
   
   # 启动后端
   cd 后端API && npm run dev
   
   # 启动前端  
   cd 后台管理系统 && npm run dev
   ```

---

## ✅ 当前修复状态

- ✅ 后端服务已启动（端口3000）
- ✅ 前端服务已启动（端口8080）
- ✅ 数据库连接正常
- ✅ 图片URL已修复（20个商品，7个分类）
- ✅ 前端图片加载优化已完成
- ✅ 所有接口测试通过

**最后更新**：2026-09-07 09:31

**验证命令**：
```bash
curl http://localhost:3000/health
```