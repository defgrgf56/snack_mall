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
        <el-descriptions-item label="手机号">{{ order.user?.phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ order.address_info }}
        </el-descriptions-item>
        <el-descriptions-item label="商品总额">¥{{ order.goods_amount }}</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ order.freight_amount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">-¥{{ order.discount_amount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">
          <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
            ¥{{ order.total_amount }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ order.payment_method }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.paid_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="快递公司" v-if="order.express_company">
          {{ order.express_company }}
        </el-descriptions-item>
        <el-descriptions-item label="快递单号" v-if="order.express_no">
          {{ order.express_no }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.created_at }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ order.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 商品列表 -->
      <div style="margin-top: 20px;">
        <h3>商品清单</h3>
        <el-table :data="order.items || []" style="width: 100%; margin-top: 10px;">
          <el-table-column label="商品" width="300">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-image 
                  :src="row.product_image" 
                  style="width: 60px; height: 60px; margin-right: 10px;"
                  fit="cover"
                />
                <span>{{ row.product_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">
              ¥{{ row.subtotal }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const loading = ref(false)
const order = ref({})

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
    pending: 'warning',
    paid: 'success',
    shipped: 'primary',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待付款',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  fetchOrderDetail()
})
</script>