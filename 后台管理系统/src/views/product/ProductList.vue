<template>
  <div class="product-list">
    <el-card shadow="never">
      <!-- 搜索筛选区 -->
      <div class="search-section">
        <el-form :model="searchForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="商品名称">
                <el-input 
                  v-model="searchForm.name" 
                  placeholder="请输入商品名称" 
                  clearable 
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="商品分类">
                <el-select v-model="searchForm.category_id" placeholder="全部分类" clearable style="width: 100%;">
                  <el-option label="全部分类" value="" />
                  <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="商品状态">
                <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 100%;">
                  <el-option label="全部状态" value="" />
                  <el-option label="上架中" :value="1" />
                  <el-option label="已下架" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label-width="0">
                <el-space>
                  <el-button type="primary" @click="handleSearch">
                    <el-icon><Search /></el-icon> 搜索
                  </el-button>
                  <el-button @click="handleReset">
                    <el-icon><RefreshLeft /></el-icon> 重置
                  </el-button>
                </el-space>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar-section">
        <div class="toolbar-left">
          <el-button type="primary" @click="$router.push('/products/create')">
            <el-icon><Plus /></el-icon> 添加商品
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-text type="info" size="small">共 {{ pagination.total }} 条记录</el-text>
        </div>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <el-card class="stat-card clickable" @click="handleStatClick('all')">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <el-card class="stat-card clickable" @click="handleStatClick('online')">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon :size="32"><Select /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.onlineCount }}</div>
              <div class="stat-label">上架商品</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <el-card class="stat-card clickable" @click="handleStatClick('offline')">
            <div class="stat-icon" style="background: #909399;">
              <el-icon :size="32"><RemoveFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.offlineCount }}</div>
              <div class="stat-label">已下架</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <el-card class="stat-card clickable" @click="handleStatClick('lowStock')">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.lowStockCount }}</div>
              <div class="stat-label">库存告急</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table 
        :data="products" 
        style="width: 100%" 
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image 
                :src="row.cover || row.image_url" 
                fit="cover" 
                class="product-image"
                :preview-src-list="[row.cover || row.image_url]"
                lazy
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-meta">
                  <el-tag size="small" type="info">ID: {{ row.id }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category.name" label="分类" width="120" align="center" />
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.stock < 10" type="danger" size="small">{{ row.stock }}</el-tag>
            <span v-else>{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link size="small" @click="handleEdit(row.id)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button 
                :type="row.status === 1 ? 'warning' : 'success'" 
                link 
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row.id)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchProducts"
        @current-change="fetchProducts"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const categories = ref([])

const stats = reactive({
  totalCount: 0,
  onlineCount: 0,
  offlineCount: 0,
  lowStockCount: 0
})

const searchForm = reactive({
  name: '',
  category_id: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    // 清理空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    console.log('请求参数:', params)
    
    const res = await request.get('/admin/products', { params })
    console.log('API 返回原始数据:', res.list?.map(p => ({ id: p.id, name: p.name })))
    
    products.value = res.list || []
    pagination.total = res.total || 0
    
    console.log('赋值后 products:', products.value.map(p => ({ id: p.id, name: p.name })))
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    categories.value = res.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/products/stats')
    Object.assign(stats, res)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const refreshData = () => {
  fetchProducts()
  fetchStats()
}

const handleStatClick = (type) => {
  // 重置搜索条件
  searchForm.name = ''
  searchForm.category_id = ''
  
  // 根据点击的卡片类型设置筛选条件
  switch (type) {
    case 'all':
      searchForm.status = ''
      break
    case 'online':
      searchForm.status = 1
      break
    case 'offline':
      searchForm.status = 0
      break
    case 'lowStock':
      // 库存告急需要特殊处理，暂时只筛选全部
      searchForm.status = ''
      ElMessage.info('已显示全部商品，请在列表中查看库存告急商品（红色标记）')
      break
  }
  
  pagination.page = 1
  fetchProducts()
}

const handleSearch = () => {
  pagination.page = 1
  fetchProducts()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category_id = ''
  searchForm.status = ''
  pagination.page = 1
  fetchProducts()
}

const handleEdit = (id) => {
  router.push(`/products/edit/${id}`)
}

const handleToggleStatus = async (row) => {
  try {
    await request.put(`/admin/products/${row.id}/status`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success('操作成功')
    fetchProducts()
    fetchStats()
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/admin/products/${id}`)
    ElMessage.success('删除成功')
    fetchProducts()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchStats()
})
</script>

<style scoped>
.product-list {
  padding: 0;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-section :deep(.el-form-item) {
  margin-bottom: 0;
}

/* 工具栏 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

/* 商品信息单元格 */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  flex-shrink: 0;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
  font-size: 15px;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

/* 分页器 */
.el-pagination {
  margin-top: 20px;
  justify-content: center;
}

/* 统计卡片 */
.stat-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  line-height: 1;
}
</style>