# 零食商城后台管理系统

## ✅ 已完成基础架构

### 1. 项目配置
- ✅ Vite 构建配置
- ✅ Vue 3 + Composition API
- ✅ Element Plus UI 框架
- ✅ Vue Router 路由配置
- ✅ Pinia 状态管理
- ✅ Axios HTTP 请求封装

### 2. 核心模块
- ✅ 用户认证(Login.vue)
- ✅ 主布局(MainLayout.vue)
- ✅ 路由守卫和权限控制
- ✅ 统一请求拦截器

### 3. 路由规划
```
/login                  - 登录页
/dashboard             - 数据看板
/products              - 商品列表
/products/create       - 添加商品
/products/edit/:id     - 编辑商品
/categories            - 商品分类
/orders                - 订单列表
/orders/:id            - 订单详情
/users                 - 用户列表
/coupons               - 优惠券管理
/banners               - 轮播图管理
/settings              - 系统设置
/admins                - 管理员管理
```

## 🚀 快速启动

### 安装依赖
```bash
cd 后台管理系统
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

### 登录凭证
- 用户名: `admin`
- 密码: `admin123`

## 📋 后续开发建议

由于后台管理系统页面众多（预计需要15-20个页面组件），建议按以下优先级逐步开发：

### 第一优先级（核心功能）
1. **Dashboard.vue** - 数据看板
   - 显示订单/商品/用户统计
   - ECharts 图表展示销售趋势
   
2. **ProductList.vue** - 商品列表
   - 商品查询、上下架
   - 跳转到商品编辑页

3. **ProductForm.vue** - 商品表单
   - 新增/编辑商品
   - 图片上传

4. **OrderList.vue** - 订单列表
   - 订单查询、筛选
   - 订单状态管理（发货）

### 第二优先级（管理功能）
5. **OrderDetail.vue** - 订单详情
6. **UserList.vue** - 用户列表
7. **CategoryList.vue** - 商品分类
8. **CouponList.vue** - 优惠券管理
9. **BannerList.vue** - 轮播图管理

### 第三优先级（系统功能）
10. **Settings.vue** - 系统设置
11. **AdminList.vue** - 管理员管理
12. **NotFound.vue** - 404页面

## 🔌 后端API对接

确保后端API服务运行：
```bash
cd ../后端API
npm start
```

后端地址: `http://localhost:3000/api`

### 管理员登录接口
```
POST /api/admin/login
Body: { username, password }
```

## 📦 现有文件说明

```
src/
├── main.js            ✅ 应用入口
├── App.vue            ✅ 根组件
├── router/
│   └── index.js       ✅ 路由配置（已完成）
├── stores/
│   └── user.js        ✅ 用户状态管理
├── utils/
│   └── request.js     ✅ Axios封装
├── views/
│   └── Login.vue      ✅ 登录页
└── layout/
    └── MainLayout.vue ⏳ 需要创建（布局组件）
```

## 🎨 页面开发模板

### 列表页模板
```vue
<template>
  <div class="page-container">
    <el-card>
      <!-- 搜索栏 -->
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-button type="primary" @click="handleAdd">新增</el-button>

      <!-- 数据表格 -->
      <el-table :data="tableData" style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const tableData = ref([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const fetchData = async () => {
  const res = await request.get('/your-api', {
    params: { page: pagination.page, limit: pagination.limit }
  })
  tableData.value = res.items
  pagination.total = res.total
}

onMounted(() => {
  fetchData()
})
</script>
```

## 💡 提示

1. 所有页面组件放在 `src/views/` 目录
2. 使用 Element Plus 组件快速搭建UI
3. API 请求使用 `src/utils/request.js` 封装的 axios 实例
4. 状态管理使用 Pinia (`src/stores/`)
5. 参考 `开发指南.md` 了解详细开发规范

## 📚 相关文档

- [开发指南.md](./开发指南.md) - 详细开发文档
- [Element Plus](https://element-plus.org/zh-CN/)
- [Vue 3](https://cn.vuejs.org/)
- [Vite](https://cn.vitejs.dev/)
