# 即时秒杀管理模块

## 概述
后台管理系统的即时秒杀管理模块，用于创建、编辑、管理秒杀活动。

## 功能清单

### 后端API（已完成）
位置：`后端API/src/routes/admin.js`

- ✅ GET `/api/admin/seckills` - 获取秒杀列表（支持分页、状态筛选、关键词搜索）
- ✅ GET `/api/admin/seckills/:id` - 获取秒杀详情
- ✅ POST `/api/admin/seckills` - 创建秒杀活动
- ✅ PUT `/api/admin/seckills/:id` - 更新秒杀活动
- ✅ DELETE `/api/admin/seckills/:id` - 删除秒杀活动
- ✅ PUT `/api/admin/seckills/:id/status` - 更新秒杀状态

### 前端页面（已完成）

#### 1. API封装
位置：`后台管理系统/src/api/seckill.js`
- 完整的秒杀管理API接口封装

#### 2. 秒杀列表页
位置：`后台管理系统/src/views/marketing/SeckillList.vue`

功能：
- 秒杀活动列表展示
- 状态筛选（未开始/进行中/已结束）
- 关键词搜索
- 分页显示
- 状态切换（启用/停用）
- 编辑秒杀
- 删除秒杀
- 显示商品信息、价格、库存、限购等

#### 3. 秒杀表单页
位置：`后台管理系统/src/views/marketing/SeckillForm.vue`

功能：
- 创建新秒杀活动
- 编辑现有秒杀活动
- 选择商品（带搜索、显示库存）
- 设置原价和秒杀价（自动计算折扣）
- 设置秒杀库存（不能超过商品库存）
- 设置限购数量
- 设置开始和结束时间
- 设置排序和状态
- 表单验证（价格合理性、时间范围等）

### 路由配置（已完成）
位置：`后台管理系统/src/router/index.js`

- `/marketing/seckills` - 秒杀列表页
- `/marketing/seckills/create` - 创建秒杀页
- `/marketing/seckills/:id/edit` - 编辑秒杀页

### 侧边栏菜单（已完成）
位置：`后台管理系统/src/layout/MainLayout.vue`
- 营销管理 > 即时秒杀

## 数据模型

### Seckill（秒杀活动）
- `id` - 秒杀ID
- `title` - 秒杀标题
- `product_id` - 关联商品ID
- `start_time` - 开始时间
- `end_time` - 结束时间
- `original_price` - 原价
- `seckill_price` - 秒杀价
- `stock` - 秒杀库存
- `sold` - 已售数量
- `limit_per_user` - 每人限购数量
- `sort` - 排序
- `status` - 状态（0:已结束, 1:进行中, 2:未开始）

## 使用说明

### 创建秒杀活动
1. 进入"营销管理 > 即时秒杀"
2. 点击"新建秒杀"按钮
3. 填写秒杀信息：
   - 秒杀标题
   - 选择商品（系统会自动填充原价）
   - 设置秒杀价（必须低于原价）
   - 设置秒杀库存（不能超过商品库存）
   - 设置限购数量
   - 设置时间范围
   - 设置排序和状态
4. 点击"创建"保存

### 管理秒杀活动
- **编辑**：点击"编辑"按钮修改秒杀信息
- **启用/停用**：快速切换秒杀活动状态
- **删除**：删除不需要的秒杀活动
- **筛选**：按状态筛选，或使用关键词搜索

### 注意事项
1. 秒杀价必须低于原价
2. 秒杀库存不能超过商品库存
3. 结束时间必须晚于开始时间
4. 删除操作不可恢复，请谨慎操作

## 技术栈
- Vue 3 + Element Plus
- Express.js + Sequelize
- MySQL 数据库

## 测试
访问后台管理系统：http://localhost:8080
登录后进入"营销管理 > 即时秒杀"进行测试。