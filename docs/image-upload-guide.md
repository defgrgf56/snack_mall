# 图片上传功能使用指南

## 功能概述

系统已集成完整的图片上传功能，包括：
- 单图上传组件 (`ImageUpload`)
- 多图上传组件 (`MultiImageUpload`)
- 拖拽排序
- 图片预览
- 图片删除

## 后端配置

### 上传接口

**单文件上传**
```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

字段名: file
```

**多文件上传**
```
POST /api/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer {token}

字段名: files (可多选，最多10个)
```

### 文件限制

- 支持格式：jpg, jpeg, png, gif, webp
- 文件大小：最大 5MB
- 存储路径：`后端API/uploads/YYYYMM/filename`
- 访问路径：`http://localhost:3000/uploads/YYYYMM/filename`

### 存储结构

```
后端API/
  └── uploads/
      └── 202609/          # 按月份分目录
          ├── file-1694000000000-123456789.jpg
          └── file-1694000001000-987654321.png
```

## 前端组件

### 1. ImageUpload（单图上传）

#### 基本用法

```vue
<template>
  <ImageUpload v-model="imageUrl" tip="上传商品封面" />
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'

const imageUrl = ref('')
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | '' | 图片URL（v-model） |
| tip | String | '点击上传图片' | 提示文字 |
| disabled | Boolean | false | 是否禁用 |
| maxSize | Number | 5 | 文件大小限制（MB） |

#### 特性

- 点击上传
- 图片预览
- 删除图片
- 悬浮遮罩效果

### 2. MultiImageUpload（多图上传）

#### 基本用法

```vue
<template>
  <MultiImageUpload v-model="images" :limit="9" />
</template>

<script setup>
import { ref } from 'vue'
import MultiImageUpload from '@/components/MultiImageUpload.vue'

const images = ref([])
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | Array | [] | 图片URL数组（v-model） |
| limit | Number | 9 | 最多上传数量 |
| disabled | Boolean | false | 是否禁用 |
| maxSize | Number | 5 | 单个文件大小限制（MB） |

#### 特性

- 多文件上传
- 拖拽排序
- 图片预览
- 删除图片
- 序号显示
- 数量限制

## 商品表单集成示例

ProductForm.vue 已集成图片上传功能：

```vue
<template>
  <el-form-item label="商品封面" prop="cover">
    <ImageUpload v-model="form.cover" tip="上传商品封面图" />
    <div class="form-tip">建议尺寸：800x800，支持 jpg、png 格式，大小不超过 5MB</div>
  </el-form-item>

  <el-form-item label="商品轮播图">
    <MultiImageUpload v-model="form.images" :limit="9" />
    <div class="form-tip">最多上传9张，支持拖拽排序</div>
  </el-form-item>
</template>

<script setup>
import { reactive } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import MultiImageUpload from '@/components/MultiImageUpload.vue'

const form = reactive({
  cover: '',
  images: []
})
</script>
```

## 认证说明

上传接口支持两种认证方式：
1. 管理员 Token（后台管理系统）
2. 用户 Token（小程序端）

Token 通过 `Authorization: Bearer {token}` 头部传递。

## 错误处理

### 常见错误

1. **401 未登录**
   - 检查 Token 是否有效
   - 检查 localStorage 中是否存储了 `admin_token`

2. **400 文件大小超限**
   - 单个文件不能超过 5MB
   - 压缩图片后重试

3. **400 文件类型不支持**
   - 只支持 jpg, jpeg, png, gif, webp 格式

4. **500 上传失败**
   - 检查服务器 `uploads` 目录权限
   - 检查磁盘空间

## 注意事项

1. **生产环境配置**
   - 配置 CDN 加速访问
   - 设置图片压缩
   - 配置防盗链
   - 定期清理过期文件

2. **安全建议**
   - 验证文件类型（MIME）
   - 限制文件大小
   - 防止路径遍历攻击
   - 设置合理的上传频率限制

3. **性能优化**
   - 图片自动压缩
   - WebP 格式支持
   - 懒加载
   - 缩略图生成

## 测试

访问 http://localhost:8081/products/create 测试图片上传功能。

## 后续改进

可选的优化方向：
- [ ] 接入阿里云 OSS / 腾讯云 COS
- [ ] 图片自动压缩
- [ ] 缩略图生成
- [ ] 图片裁剪功能
- [ ] 水印添加
- [ ] WebP 自动转换