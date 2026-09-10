<template>
  <div class="order-detail">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>订单详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border v-loading="loading">
        <el-descriptions-item label="订单号">{{ order.order_no }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">{{ order.user?.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ order.phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ order.province }} {{ order.city }} {{ order.district }} {{ order.address }}
        </el-descriptions-item>
        <el-descriptions-item label="商品总额">¥{{ order.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ order.freight_amount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">-¥{{ order.discount_amount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">
          <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
            ¥{{ order.pay_amount }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ order.pay_method === 1 ? '微信支付' : order.pay_method === 2 ? '余额支付' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.pay_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="快递公司" v-if="order.ship_company">
          {{ order.ship_company }}
        </el-descriptions-item>
        <el-descriptions-item label="快递单号" v-if="order.ship_no">
          {{ order.ship_no }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.created_at }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ order.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: right;">
        <el-button 
          v-if="order.status === 2" 
          type="success" 
          @click="handleShip"
        >
          <el-icon><Ship /></el-icon> 发货
        </el-button>
        <el-button 
          v-if="order.status === 1" 
          type="danger" 
          @click="handleCancel"
        >
          <el-icon><Close /></el-icon> 取消订单
        </el-button>
        <el-button 
          v-if="[2, 3].includes(order.status)" 
          type="warning" 
          @click="handleRefund"
        >
          <el-icon><RefreshLeft /></el-icon> 退款
        </el-button>
      </div>

      <!-- 商品列表 -->
      <div style="margin-top: 20px;">
        <h3>商品清单</h3>
        <el-table :data="order.items || []" style="width: 100%; margin-top: 10px;" border>
          <el-table-column label="商品" width="350">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-image 
                  :src="row.product_cover" 
                  style="width: 60px; height: 60px; margin-right: 10px; border-radius: 4px;"
                  fit="cover"
                />
                <div>
                  <div style="font-weight: 500;">{{ row.product_name }}</div>
                  <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                    商品ID: {{ row.product_id }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="120" align="right">
            <template #default="{ row }">
              <span style="color: #f56c6c;">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" align="center" />
          <el-table-column prop="total_amount" label="小计" width="120" align="right">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: bold;">¥{{ row.total_amount }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog 
      v-model="shipDialogVisible" 
      title="订单发货" 
      width="600px"
      :close-on-click-modal="false"
    >
      <!-- 订单基本信息 -->
      <div v-if="order" class="ship-order-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="订单号">
            <el-tag size="small">{{ order.order_no }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货人">
            {{ order.consignee }} {{ order.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址">
            {{ order.province }}{{ order.city }}{{ order.district }}{{ order.address }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 商品列表 -->
        <div class="ship-products" v-if="order.items && order.items.length > 0">
          <div class="ship-products-title">商品列表</div>
          <div class="ship-product-item" v-for="item in order.items" :key="item.id">
            <el-image 
              :src="item.product_cover" 
              fit="cover" 
              class="ship-product-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="ship-product-info">
              <div class="ship-product-name">{{ item.product_name }}</div>
              <div class="ship-product-meta">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <el-form :model="shipForm" label-width="100px" ref="shipFormRef" :rules="shipRules">
        <el-form-item label="快递公司" prop="express_company">
          <el-select 
            v-model="shipForm.express_company" 
            placeholder="请选择快递公司" 
            style="width: 100%;"
            filterable
            @change="saveLastExpressCompany"
          >
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
          <el-input 
            v-model="shipForm.express_no" 
            placeholder="请输入快递单号" 
            clearable
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="shipForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="选填，备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :loading="submitting">确定发货</el-button>
      </template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog v-model="refundDialogVisible" title="订单退款" width="500px">
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="退款原因">
          <el-input 
            v-model="refundForm.reason" 
            type="textarea" 
            :rows="3"
            placeholder="请输入退款原因（可选）" 
          />
        </el-form-item>
        <el-alert 
          title="退款后订单状态将变更为已退款，此操作不可撤销" 
          type="warning" 
          :closable="false"
          style="margin-bottom: 10px;"
        />
      </el-form>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmRefund" :loading="submitting">确认退款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const order = ref({})
const shipDialogVisible = ref(false)
const refundDialogVisible = ref(false)
const shipFormRef = ref(null)

const shipForm = reactive({
  express_company: '',
  express_no: '',
  remark: ''
})

const refundForm = reactive({
  reason: ''
})

// 快递单号验证规则
const validateExpressNo = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入快递单号'))
  } else if (value.length < 8) {
    callback(new Error('快递单号长度不能少于8位'))
  } else if (!/^[A-Za-z0-9]+$/.test(value)) {
    callback(new Error('快递单号只能包含字母和数字'))
  } else {
    callback()
  }
}

const shipRules = {
  express_company: [
    { required: true, message: '请选择快递公司', trigger: 'change' }
  ],
  express_no: [
    { required: true, validator: validateExpressNo, trigger: 'blur' }
  ]
}

const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const res = await request.get(`/admin/orders/${route.params.id}`)
    order.value = res
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    1: 'warning',   // 待付款
    2: 'info',      // 已付款/待发货
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

const handleShip = () => {
  // 尝试从 localStorage 读取上次选择的快递公司
  const lastExpressCompany = localStorage.getItem('lastExpressCompany')
  
  shipForm.express_company = lastExpressCompany || ''
  shipForm.express_no = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

// 保存上次选择的快递公司
const saveLastExpressCompany = (value) => {
  if (value) {
    localStorage.setItem('lastExpressCompany', value)
  }
}

const confirmShip = async () => {
  if (!shipFormRef.value) return
  
  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await request.put(`/admin/orders/${route.params.id}/ship`, {
        express_company: shipForm.express_company,
        express_no: shipForm.express_no,
        remark: shipForm.remark
      })
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      await fetchOrderDetail()
    } catch (error) {
      console.error('发货失败:', error)
      ElMessage.error(error.message || '发货失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    
    submitting.value = true
    await request.put(`/admin/orders/${route.params.id}/cancel`)
    ElMessage.success('取消成功')
    await fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleRefund = () => {
  refundForm.reason = ''
  refundDialogVisible.value = true
}

const confirmRefund = async () => {
  try {
    await ElMessageBox.confirm('确认对该订单进行退款操作？', '退款确认', {
      type: 'warning',
      confirmButtonText: '确认退款',
      cancelButtonText: '取消'
    })

    submitting.value = true
    await request.put(`/admin/orders/${route.params.id}/refund`, {
      reason: refundForm.reason || '管理员退款'
    })
    ElMessage.success('退款成功')
    refundDialogVisible.value = false
    await fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退款失败:', error)
      ElMessage.error(error.message || '退款失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

/* 发货对话框样式 */
.ship-order-info {
  margin-bottom: 20px;
}

.ship-products {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.ship-products-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.ship-product-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.ship-product-item:last-child {
  margin-bottom: 0;
}

.ship-product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.ship-product-info {
  flex: 1;
  min-width: 0;
}

.ship-product-name {
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ship-product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.ship-product-meta .price {
  color: #f56c6c;
  font-weight: 600;
}

.ship-product-meta .quantity {
  color: #909399;
}
</style>