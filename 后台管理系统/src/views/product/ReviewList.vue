<template>
  <div class="review-list-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total"><el-icon><ChatDotSquare /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">全部评价</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon good"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.good }}</div>
              <div class="stat-label">好评 (4-5星)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon images"><el-icon><Picture /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.withImages }}</div>
              <div class="stat-label">晒单评价</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品评价管理</span>
          <div class="header-actions">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索评价内容"
              clearable
              style="width: 200px; margin-right: 10px;"
              @keyup.enter="fetchList"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="filters.rating" placeholder="评分" clearable style="width: 120px; margin-right: 10px;" @change="fetchList">
              <el-option label="5星" :value="5" />
              <el-option label="4星" :value="4" />
              <el-option label="3星" :value="3" />
              <el-option label="2星" :value="2" />
              <el-option label="1星" :value="1" />
            </el-select>
            <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;" @change="fetchList">
              <el-option label="已通过" :value="1" />
              <el-option label="待审核" :value="0" />
              <el-option label="已拒绝" :value="2" />
            </el-select>
            <div class="sort-btns">
              <el-button
                :type="sorting.sortBy === 'created_at' ? 'primary' : ''"
                @click="handleSort('created_at')"
                size="small"
              >
                时间
                <el-icon v-if="sorting.sortBy === 'created_at'" :size="12" style="margin-left:2px;">
                  <ArrowUp v-if="sorting.sortOrder === 'ASC'" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
              <el-button
                :type="sorting.sortBy === 'rating' ? 'primary' : ''"
                @click="handleSort('rating')"
                size="small"
              >
                评分
                <el-icon v-if="sorting.sortBy === 'rating'" :size="12" style="margin-left:2px;">
                  <ArrowUp v-if="sorting.sortOrder === 'ASC'" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
            </div>
            <el-button @click="fetchList"><el-icon><Refresh /></el-icon></el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe empty-text="暂无评价数据">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="商品" min-width="180">
          <template #default="{ row }">
            <div class="product-cell" v-if="row.product">
              <el-image :src="row.product.cover" style="width: 40px; height: 40px; border-radius: 4px;" fit="cover" lazy />
              <span class="product-name">{{ row.product.name }}</span>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" :src="isValidAvatar(row.user?.avatar) ? row.user.avatar : ''">
                <el-icon :size="14"><User /></el-icon>
              </el-avatar>
              <span>{{ row.user?.nickname || '匿名' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="140" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="200">
          <template #default="{ row }">
            <div class="content-cell">
              <div class="content-text">{{ row.content || '暂无内容' }}</div>
              <div class="content-images" v-if="row.images && row.images.length > 0">
                <el-image
                  v-for="(img, idx) in row.images.slice(0, 3)"
                  :key="idx"
                  :src="img.image_url"
                  style="width: 50px; height: 50px; border-radius: 4px; margin-right: 4px;"
                  fit="cover"
                  :preview-src-list="row.images.map(i => i.image_url)"
                  :initial-index="idx"
                  preview-teleported
                  lazy
                />
                <span v-if="row.images.length > 3" class="more-images">+{{ row.images.length - 3 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商家回复" width="160">
          <template #default="{ row }">
            <span v-if="row.reply_content" class="reply-text">{{ row.reply_content }}</span>
            <span v-else class="text-muted">未回复</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleReply(row)">回复</el-button>
            <el-button link type="success" size="small" @click="handleAudit(row, 1)" v-if="row.status === 0">通过</el-button>
            <el-button link type="warning" size="small" @click="handleAudit(row, 2)" v-if="row.status === 0">拒绝</el-button>
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

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialog.visible" title="回复评价" width="500px">
      <el-input
        v-model="replyDialog.content"
        type="textarea"
        :rows="4"
        placeholder="请输入回复内容"
        maxlength="200"
        show-word-limit
      />
      <template #footer>
        <el-button @click="replyDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="replyDialog.loading" @click="submitReply">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ChatDotSquare, Clock, CircleCheck, Picture, User, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const list = ref([])
const stats = reactive({ total: 0, pending: 0, good: 0, withImages: 0 })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filters = reactive({ keyword: '', rating: '', status: '' })
const sorting = reactive({ sortBy: 'created_at', sortOrder: 'DESC' })

const replyDialog = reactive({ visible: false, loading: false, id: null, content: '' })

const statusType = (s) => ({ 0: 'warning', 1: 'success', 2: 'danger' })[s] || 'info'
const statusLabel = (s) => ({ 0: '待审核', 1: '已通过', 2: '已拒绝' })[s] || '未知'

const isValidAvatar = (url) => {
  return url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
}

const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
}

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/reviews/stats')
    Object.assign(stats, res)
  } catch (e) { /* silent */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.rating) params.rating = filters.rating
    if (filters.status !== '' && filters.status !== undefined) params.status = filters.status
    params.sortBy = sorting.sortBy
    params.sortOrder = sorting.sortOrder
    const res = await request.get('/admin/reviews', { params })
    list.value = res.list || []
    pagination.total = res.pagination?.total || 0
  } catch (e) {
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

const handleSort = (field) => {
  if (sorting.sortBy === field) {
    sorting.sortOrder = sorting.sortOrder === 'DESC' ? 'ASC' : 'DESC'
  } else {
    sorting.sortBy = field
    sorting.sortOrder = 'DESC'
  }
  pagination.page = 1
  fetchList()
}

const handleReply = (row) => {
  replyDialog.id = row.id
  replyDialog.content = row.reply_content || ''
  replyDialog.visible = true
}

const submitReply = async () => {
  if (!replyDialog.content.trim()) return ElMessage.warning('请输入回复内容')
  replyDialog.loading = true
  try {
    await request.put(`/admin/reviews/${replyDialog.id}/reply`, { reply_content: replyDialog.content })
    ElMessage.success('回复成功')
    replyDialog.visible = false
    fetchList()
  } catch (e) {
    ElMessage.error('回复失败')
  } finally {
    replyDialog.loading = false
  }
}

const handleAudit = async (row, status) => {
  const label = status === 1 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要${label}该评价吗？`, '审核确认', { type: 'warning' })
    await request.put(`/admin/reviews/${row.id}/status`, { status })
    ElMessage.success(`已${label}`)
    fetchList()
    fetchStats()
  } catch (e) { /* cancelled */ }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该评价吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    await request.delete(`/admin/reviews/${row.id}`)
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
.review-list-page { padding: 20px; }
.stats-row { margin-bottom: 20px; }
.stat-card { cursor: pointer; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }
.stat-content { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; }
.stat-icon.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.pending { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.good { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-icon.images { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; align-items: center; }
.product-cell { display: flex; align-items: center; gap: 8px; }
.product-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 130px; }
.user-cell { display: flex; align-items: center; gap: 6px; }
.content-cell { line-height: 1.6; }
.content-text { margin-bottom: 6px; }
.content-images { display: flex; align-items: center; }
.more-images { font-size: 12px; color: #909399; margin-left: 4px; }
.reply-text { color: #67c23a; font-size: 13px; }
.text-muted { color: #c0c4cc; font-size: 13px; }
.time-text { font-size: 13px; color: #909399; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.sort-btns { display: flex; gap: 4px; margin-right: 10px; }
</style>