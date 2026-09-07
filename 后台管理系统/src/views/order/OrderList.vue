<template>
  <div class="order-list">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">全部订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="filterByStatus(2)">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待发货</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="filterByStatus(4)">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.totalAmount }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.order_no" placeholder="请输入订单号" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.user_nickname" placeholder="请输入用户昵称" clearable style="width: 150px;" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="全部" :value="null" />
            <el-option label="待付款" :value="1" />
            <el-option label="待发货" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="已完成" :value="4" />
            <el-option label="已取消" :value="5" />
            <el-option label="超时" :value="6" />
            <el-option label="已退款" :value="7" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 订单列表 -->
      <el-table :data="orders" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="order_no" label="订单号" width="180" align="center" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div v-if="row.items && row.items.length > 0" class="order-items">
              <div v-for="item in row.items.slice(0, 2)" :key="item.id" class="order-item">
                <el-image 
                  :src="item.product_cover" 
                  fit="cover" 
                  class="product-image"
                  :preview-src-list="row.items.map(i => i.product_cover)"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="product-info">
                  <div class="product-name">{{ item.product_name }}</div>
                  <div class="product-meta">
                    <span class="price">¥{{ item.price }}</span>
                    <span class="quantity">×{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
              <div v-if="row.items.length > 2" class="more-items">
                +{{ row.items.length - 2 }} 件商品
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="120" align="center">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-name">{{ row.user?.nickname || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="center">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="pay-amount">¥{{ row.pay_amount }}</div>
              <div class="total-amount" v-if="row.total_amount !== row.pay_amount">
                原价: ¥{{ row.total_amount }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_method" label="支付方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.pay_method" type="success" size="small">
              {{ getPayMethodText(row.pay_method) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-info">
              <div>{{ formatDate(row.created_at) }}</div>
              <div class="time-ago">{{ getTimeAgo(row.created_at) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="handleView(row.id)">
                <el-icon><View /></el-icon> 详情
              </el-button>
              <el-button 
                v-if="row.status === 2" 
                type="success" 
                link 
                size="small"
                @click="handleShip(row)"
              >
                <el-icon><Promotion /></el-icon> 发货
              </el-button>
              <el-button 
                v-if="row.status === 1" 
                type="danger" 
                link 
                size="small"
                @click="handleCancel(row.id)"
              >
                <el-icon><Close /></el-icon> 取消
              </el-button>
              <el-button 
                v-if="row.status === 3" 
                type="info" 
                link 
                size="small"
                @click="handleComplete(row.id)"
              >
                <el-icon><Check /></el-icon> 完成
              </el-button>
            </div>
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
        @size-change="fetchOrders"
        @current-change="fetchOrders"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px" ref="shipFormRef" :rules="shipRules">
        <el-form-item label="快递公司" prop="express_company">
          <el-select v-model="shipForm.express_company" placeholder="请选择快递公司" style="width: 100%;">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="百世快递" value="百世快递" />
            <el-option label="邮政EMS" value="邮政EMS" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="express_no">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="shipForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="选填，备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :loading="submitting">确定发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, 
  Clock, 
  CircleCheck, 
  Money, 
  Search, 
  View, 
  Picture,
  User,
  Promotion,
  Close,
  Check
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const orders = ref([])
const shipDialogVisible = ref(false)
const currentOrder = ref(null)
const shipFormRef = ref(null)

const searchForm = reactive({
  order_no: '',
  user_nickname: '',
  status: null,
  dateRange: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const shipForm = reactive({
  express_company: '',
  express_no: '',
  remark: ''
})

const shipRules = {
  express_company: [
    { required: true, message: '请选择快递公司', trigger: 'change' }
  ],
  express_no: [
    { required: true, message: '请输入快递单号', trigger: 'blur' }
  ]
}

// 统计数据
const stats = computed(() => {
  return {
    total: pagination.total,
    pending: orders.value.filter(o => o.status === 2).length,
    completed: orders.value.filter(o => o.status === 4).length,
    totalAmount: orders.value
      .filter(o => [2, 3, 4].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.pay_amount || 0), 0)
      .toFixed(2)
  }
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      order_no: searchForm.order_no,
      status: searchForm.status
    }
    
    // 添加日期范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    
    // 添加用户昵称搜索
    if (searchForm.user_nickname) {
      params.user_nickname = searchForm.user_nickname
    }
    
    const res = await request.get('/admin/orders', { params })
    orders.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 点击统计卡片筛选
const filterByStatus = (status) => {
  searchForm.status = status
  pagination.page = 1
  fetchOrders()
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrders()
}

const handleReset = () => {
  searchForm.order_no = ''
  searchForm.user_nickname = ''
  searchForm.status = null
  searchForm.dateRange = null
  pagination.page = 1
  fetchOrders()
}

const handleView = (id) => {
  router.push(`/orders/${id}`)
}

const handleShip = (order) => {
  currentOrder.value = order
  shipForm.express_company = ''
  shipForm.express_no = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  if (!shipFormRef.value) return
  
  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await request.put(`/admin/orders/${currentOrder.value.id}/ship`, {
        ship_company: shipForm.express_company,
        ship_no: shipForm.express_no,
        remark: shipForm.remark
      })
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      fetchOrders()
    } catch (error) {
      console.error('发货失败:', error)
      ElMessage.error(error.message || '发货失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleComplete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要完成该订单吗？', '提示', {
      type: 'warning'
    })
    await request.put(`/admin/orders/${id}/complete`)
    ElMessage.success('操作成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleCancel = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    await request.put(`/admin/orders/${id}/cancel`)
    ElMessage.success('取消成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const getStatusType = (status) => {
  const map = {
    1: 'warning',   // 待付款
    2: 'info',      // 待发货
    3: 'primary',   // 已发货
    4: 'success',   // 已完成
    5: 'info',      // 已取消
    6: 'info',      // 超时
    7: 'danger'     // 已退款
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    1: '待付款',
    2: '待发货',
    3: '已发货',
    4: '已完成',
    5: '已取消',
    6: '超时',
    7: '已退款'
  }
  return map[status] || '未知'
}

const getPayMethodText = (method) => {
  const map = {
    1: '微信',
    2: '余额'
  }
  return map[method] || '-'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 获取相对时间
const getTimeAgo = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return ''
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  padding: 20px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 28px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.amount {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 搜索表单 */
.search-form {
  margin-bottom: 20px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

/* 商品信息 */
.order-items {
  padding: 8px 0;
}

.order-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
  cursor: pointer;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.product-meta .price {
  color: #f56c6c;
  font-weight: 600;
}

.product-meta .quantity {
  color: #909399;
}

.more-items {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

/* 用户信息 */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 13px;
  color: #606266;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 金额信息 */
.amount-info {
  text-align: center;
}

.pay-amount {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 4px;
}

.total-amount {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

/* 时间信息 */
.time-info {
  text-align: center;
}

.time-info > div:first-child {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.time-ago {
  font-size: 12px;
  color: #909399;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.action-buttons .el-button {
  margin: 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

/* 响应式优化 */
@media (max-width: 1400px) {
  .stat-value {
    font-size: 24px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}
</style>