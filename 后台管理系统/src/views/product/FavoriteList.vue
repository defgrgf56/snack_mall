<template>
  <div class="favorite-list-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total"><el-icon><Star /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">全部收藏</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon today"><el-icon><Calendar /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayCount }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon week"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.weekCount }}</div>
              <div class="stat-label">本周新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users"><el-icon><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.uniqueUsers }}</div>
              <div class="stat-label">收藏用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排行榜 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="12">
        <el-card shadow="hover" class="rank-card">
          <template #header><span class="card-title">收藏排行 Top 10</span></template>
          <div class="rank-list" v-if="stats.topProducts?.length">
            <div v-for="(item, idx) in stats.topProducts" :key="idx" class="rank-item">
              <div class="rank-badge" :class="`rank-${idx + 1}`">{{ idx + 1 }}</div>
              <el-image :src="item.product?.cover" style="width: 36px; height: 36px; border-radius: 4px;" fit="cover" lazy />
              <span class="rank-name">{{ item.product?.name || '-' }}</span>
              <span class="rank-count">{{ item.dataValues?.count || 0 }} 次</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="rank-card">
          <template #header><span class="card-title">收藏达人 Top 10</span></template>
          <div class="rank-list" v-if="stats.topUsers?.length">
            <div v-for="(item, idx) in stats.topUsers" :key="idx" class="rank-item">
              <div class="rank-badge" :class="`rank-${idx + 1}`">{{ idx + 1 }}</div>
              <el-avatar :size="36" :src="isValidAvatar(item.user?.avatar) ? item.user.avatar : ''">
                <el-icon :size="14"><User /></el-icon>
              </el-avatar>
              <span class="rank-name">{{ item.user?.nickname || '匿名' }}</span>
              <span class="rank-count">{{ item.dataValues?.count || 0 }} 个收藏</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品收藏管理</span>
          <div class="header-actions">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索商品/用户"
              clearable
              style="width: 180px; margin-right: 8px;"
              @keyup.enter="fetchList"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px; margin-right: 8px;"
              @change="fetchList"
            />
            <el-select v-model="filters.categoryId" placeholder="商品分类" clearable style="width: 140px; margin-right: 8px;" @change="fetchList">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
            <el-select v-model="currentSortOption" @change="handleSort" style="width: 130px; margin-right: 8px;" size="default">
              <el-option label="最新收藏" value="created_at:DESC" />
              <el-option label="最早收藏" value="created_at:ASC" />
            </el-select>
            <el-button @click="handleExport" style="margin-right: 8px;"><el-icon><Download /></el-icon>导出</el-button>
            <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除{{ selectedIds.length ? `(${selectedIds.length})` : '' }}
            </el-button>
            <el-button @click="fetchList"><el-icon><Refresh /></el-icon></el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="list"
        v-loading="loading"
        border
        stripe
        empty-text="暂无收藏数据"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div class="product-cell" v-if="row.product">
              <el-image :src="row.product.cover" style="width: 44px; height: 44px; border-radius: 4px;" fit="cover" lazy />
              <div class="product-info">
                <div class="product-name">{{ row.product.name }}</div>
                <div class="product-price">¥{{ row.product.price }}</div>
              </div>
            </div>
            <span v-else class="text-muted">商品已删除</span>
          </template>
        </el-table-column>
        <el-table-column label="收藏用户" width="140">
          <template #default="{ row }">
            <div class="user-cell" v-if="row.user">
              <el-avatar :size="28" :src="isValidAvatar(row.user.avatar) ? row.user.avatar : ''">
                <el-icon :size="14"><User /></el-icon>
              </el-avatar>
              <span>{{ row.user.nickname }}</span>
            </div>
            <span v-else class="text-muted">用户已注销</span>
          </template>
        </el-table-column>
        <el-table-column label="收藏时间" width="170" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Star, User, Calendar, TrendCharts, Download } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const list = ref([])
const categories = ref([])
const selectedIds = ref([])
const stats = reactive({ total: 0, todayCount: 0, weekCount: 0, uniqueUsers: 0, topProducts: [], topUsers: [] })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filters = reactive({ keyword: '', dateRange: null, categoryId: '' })
const currentSortOption = ref('created_at:DESC')
const sorting = reactive({ sortBy: 'created_at', sortOrder: 'DESC' })

const isValidAvatar = (url) => {
  return url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
}

const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
}

const handleSort = (val) => {
  const [sortBy, sortOrder] = val.split(':')
  sorting.sortBy = sortBy
  sorting.sortOrder = sortOrder
  pagination.page = 1
  fetchList()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    categories.value = res.list || res || []
  } catch (e) { /* silent */ }
}

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/favorites/stats')
    Object.assign(stats, res)
  } catch (e) { /* silent */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.dateStart = filters.dateRange[0]
      params.dateEnd = filters.dateRange[1]
    }
    if (filters.categoryId) params.categoryId = filters.categoryId
    params.sortBy = sorting.sortBy
    params.sortOrder = sorting.sortOrder
    const res = await request.get('/admin/favorites', { params })
    list.value = res.list || []
    pagination.total = res.pagination?.total || 0
  } catch (e) {
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该收藏记录吗？', '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'danger'
  }).then(async () => {
    await request.delete(`/admin/favorites/${row.id}`)
    ElMessage.success('删除成功')
    fetchList()
    fetchStats()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条收藏记录吗？`, '批量删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'danger'
  }).then(async () => {
    await request.post('/admin/favorites/batch-delete', { ids: selectedIds.value })
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchList()
    fetchStats()
  }).catch(() => {})
}

const handleExport = async () => {
  try {
    const params = { page: 1, pageSize: 9999 }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.dateStart = filters.dateRange[0]
      params.dateEnd = filters.dateRange[1]
    }
    if (filters.categoryId) params.categoryId = filters.categoryId
    params.sortBy = sorting.sortBy
    params.sortOrder = sorting.sortOrder
    const res = await request.get('/admin/favorites', { params })
    const rows = res.list || []
    const header = ['ID', '商品名称', '商品价格', '收藏用户', '收藏时间']
    const csvRows = [header.join(',')]
    rows.forEach(r => {
      csvRows.push([
        r.id,
        `"${(r.product?.name || '').replace(/"/g, '""')}"`,
        r.product?.price || '',
        `"${(r.user?.nickname || '').replace(/"/g, '""')}"`,
        formatDate(r.created_at)
      ].join(','))
    })
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `收藏数据_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchCategories()
  fetchStats()
  fetchList()
})
</script>

<style scoped>
.favorite-list-page { padding: 20px; }
.stats-row { margin-bottom: 16px; }
.stat-card { cursor: pointer; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }
.stat-content { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; }
.stat-icon.total { background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); }
.stat-icon.today { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-icon.week { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.users { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.rank-card { height: 100%; }
.card-title { font-weight: 600; }
.rank-list { display: flex; flex-direction: column; gap: 10px; }
.rank-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.rank-badge { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; background: #c0c4cc; flex-shrink: 0; }
.rank-badge.rank-1 { background: #f56c6c; }
.rank-badge.rank-2 { background: #e6a23c; }
.rank-badge.rank-3 { background: #409eff; }
.rank-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.rank-count { font-size: 12px; color: #909399; white-space: nowrap; }
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.header-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
.product-cell { display: flex; align-items: center; gap: 10px; }
.product-info { line-height: 1.4; }
.product-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
.product-price { font-size: 13px; color: #f56c6c; font-weight: 500; }
.user-cell { display: flex; align-items: center; gap: 6px; }
.text-muted { color: #c0c4cc; font-size: 13px; }
.time-text { font-size: 13px; color: #909399; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>