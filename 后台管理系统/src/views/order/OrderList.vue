<template>
  <div class="order-list">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.order_no" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 订单列表 -->
      <el-table :data="orders" style="width: 100%" v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user.nickname" label="用户" width="120" />
        <el-table-column prop="pay_amount" label="实付金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ row.pay_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_method" label="支付方式" width="100">
          <template #default="{ row }">
            {{ getPayMethodText(row.pay_method) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row.id)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button 
              v-if="row.status === 2" 
              type="success" 
              link 
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button 
              v-if="row.status === 1" 
              type="danger" 
              link 
              @click="handleCancel(row.id)"
            >
              取消
            </el-button>
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
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-input v-model="shipForm.express_company" placeholder="请输入快递公司" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const orders = ref([])
const shipDialogVisible = ref(false)
const currentOrder = ref(null)

const searchForm = reactive({
  order_no: '',
  status: null  // 改为 null，与后端数字类型匹配
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const shipForm = reactive({
  express_company: '',
  express_no: ''
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/orders', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
    })
    orders.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrders()
}

const handleReset = () => {
  searchForm.order_no = ''
  searchForm.status = null  // 改为 null
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
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  if (!shipForm.express_company || !shipForm.express_no) {
    ElMessage.warning('请填写完整的快递信息')
    return
  }

  submitting.value = true
  try {
    await request.put(`/admin/orders/${currentOrder.value.id}/ship`, shipForm)
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error(error.message || '发货失败')
  } finally {
    submitting.value = false
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
    1: '微信支付',
    2: '余额支付'
  }
  return map[method] || '-'
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  :deep(.el-form--inline .el-form-item) {
    margin-right: 20px;
  }
}
</style>