<template>
  <div class="favorite-list-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
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
      <el-col :span="16">
        <el-card shadow="hover" class="stat-card top-products-card">
          <template #header>
            <span class="card-title">收藏排行 Top 10</span>
          </template>
          <div class="top-products" v-if="stats.topProducts && stats.topProducts.length > 0">
            <div
              v-for="(item, idx) in stats.topProducts"
              :key="idx"
              class="top-item"
            >
              <div class="top-rank" :class="`rank-${idx + 1}`">{{ idx + 1 }}</div>
              <el-image :src="item.product?.cover" style="width: 36px; height: 36px; border-radius: 4px;" fit="cover" lazy />
              <span class="top-name">{{ item.product?.name || '-' }}</span>
              <span class="top-count">{{ item.dataValues?.count || 0 }} 次收藏</span>
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
              style="width: 200px; margin-right: 10px;"
              @keyup.enter="fetchList"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button @click="fetchList"><el-icon><Refresh /></el-icon></el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe empty-text="暂无收藏数据">
        <el-table-column prop="id" label="ID" width="70" align="center" />
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
        <el-table-column label="收藏用户" width="150">
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
        <el-table-column label="操作" width="120" fixed="right" align="center">
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
import { Search, Refresh, Star, User } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const list = ref([])
const stats = reactive({ total: 0, topProducts: [] })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filters = reactive({ keyword: '' })

const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
}

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/favorites/stats')
    stats.total = res.total || 0
    stats.topProducts = res.topProducts || []
  } catch (e) { /* silent */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filters.keyword) params.keyword = filters.keyword
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
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    await request.delete(`/admin/favorites/${row.id}`)
    ElMessage.success('删除成功')
    fetchList()
    fetchStats()
  }).catch(() => {})
}

onMounted(() => {
  fetchStats()
  fetchList()
})
</script>

<style scoped>
.favorite-list-page { padding: 20px; }
.stats-row { margin-bottom: 20px; }
.stat-card { transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }
.stat-content { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; }
.stat-icon.total { background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.card-title { font-weight: 600; }
.top-products { display: flex; flex-direction: column; gap: 10px; }
.top-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.top-rank { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; background: #c0c4cc; }
.top-rank.rank-1 { background: #f56c6c; }
.top-rank.rank-2 { background: #e6a23c; }
.top-rank.rank-3 { background: #409eff; }
.top-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.top-count { font-size: 12px; color: #909399; white-space: nowrap; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; align-items: center; }
.product-cell { display: flex; align-items: center; gap: 10px; }
.product-info { line-height: 1.4; }
.product-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
.product-price { font-size: 13px; color: #f56c6c; font-weight: 500; }
.user-cell { display: flex; align-items: center; gap: 6px; }
.text-muted { color: #c0c4cc; font-size: 13px; }
.time-text { font-size: 13px; color: #909399; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>