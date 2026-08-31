<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon :size="40"><Goods /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.productCount }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon :size="40"><List /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon :size="40"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #f56c6c;">
            <el-icon :size="40"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.totalSales }}</div>
            <div class="stat-label">总销售额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单统计 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单状态统计</span>
            </div>
          </template>
          <div class="order-stats">
            <div class="order-stat-item">
              <div class="label">待付款</div>
              <div class="value">{{ stats.orderStats.pending || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">待发货</div>
              <div class="value">{{ stats.orderStats.paid || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">已发货</div>
              <div class="value">{{ stats.orderStats.shipped || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">已完成</div>
              <div class="value">{{ stats.orderStats.completed || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/products/create')">
              <el-icon><Plus /></el-icon> 添加商品
            </el-button>
            <el-button type="success" @click="$router.push('/orders')">
              <el-icon><List /></el-icon> 订单管理
            </el-button>
            <el-button type="warning" @click="$router.push('/coupons')">
              <el-icon><Ticket /></el-icon> 优惠券管理
            </el-button>
            <el-button type="info" @click="$router.push('/banners')">
              <el-icon><Picture /></el-icon> 轮播图管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
              <el-button type="primary" link @click="$router.push('/orders')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="user.nickname" label="用户" width="120" />
            <el-table-column prop="total_amount" label="订单金额" width="120">
              <template #default="{ row }">
                ¥{{ row.total_amount }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="下单时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const stats = reactive({
  productCount: 0,
  orderCount: 0,
  userCount: 0,
  totalSales: 0,
  orderStats: {
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0
  }
})

const recentOrders = ref([])

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/statistics')
    if (res.code === 200) {
      stats.totalSales = res.data.totalSales || 0
      stats.orderCount = res.data.totalOrders || 0
      stats.userCount = res.data.totalUsers || 0
      stats.productCount = res.data.totalProducts || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 使用模拟数据
    stats.productCount = 128
    stats.orderCount = 456
    stats.userCount = 1280
    stats.totalSales = 45678.90
    stats.orderStats = {
      pending: 12,
      paid: 23,
      shipped: 34,
      completed: 387
    }
  }
}

const fetchRecentOrders = async () => {
  try {
    // 使用管理员订单列表API获取最近的订单
    const res = await request.get('/admin/orders', {
      params: { page: 1, pageSize: 5 }
    })
    recentOrders.value = res.list || []
  } catch (error) {
    console.error('获取最近订单失败:', error)
    // 模拟数据
    recentOrders.value = []
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
  fetchStats()
  fetchRecentOrders()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .stat-card {
    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-right: 20px;
      flex-shrink: 0;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .order-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;

    .order-stat-item {
      text-align: center;

      .label {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }
}
</style>