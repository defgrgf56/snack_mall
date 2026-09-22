<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 刷新按钮 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24" style="text-align: right;">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </el-col>
    </el-row>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon :size="40"><Goods /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.productCount) }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon :size="40"><List /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.orderCount) }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon :size="40"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.userCount) }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #f56c6c;">
            <el-icon :size="40"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(stats.totalSales) }}</div>
            <div class="stat-label">总销售额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单统计与快捷操作 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12" :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单状态统计</span>
            </div>
          </template>
          <div class="order-stats">
            <div class="order-stat-item">
              <div class="label">待付款</div>
              <div class="value" style="color: #e6a23c;">{{ stats.orderStats.pending || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">待发货</div>
              <div class="value" style="color: #67c23a;">{{ stats.orderStats.paid || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">已发货</div>
              <div class="value" style="color: #409eff;">{{ stats.orderStats.shipped || 0 }}</div>
            </div>
            <div class="order-stat-item">
              <div class="label">已完成</div>
              <div class="value" style="color: #909399;">{{ stats.orderStats.completed || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/products')">
              <el-icon><Plus /></el-icon> 添加商品
            </el-button>
            <el-button type="success" @click="$router.push('/orders')">
              <el-icon><List /></el-icon> 订单管理
            </el-button>
            <el-button type="warning" @click="$router.push('/users')">
              <el-icon><User /></el-icon> 用户管理
            </el-button>
            <el-button type="info" @click="$router.push('/statistics')">
              <el-icon><DataAnalysis /></el-icon> 数据分析
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12" :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售趋势（最近7天）</span>
            </div>
          </template>
          <div ref="salesChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热销商品TOP10</span>
            </div>
          </template>
          <div ref="hotProductsChartRef" style="height: 300px;"></div>
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
          <el-table :data="recentOrders" style="width: 100%" v-if="recentOrders.length > 0">
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="user.nickname" label="用户" width="120" />
            <el-table-column prop="total_amount" label="订单金额" width="120">
              <template #default="{ row }">
                ¥{{ formatMoney(row.total_amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="下单时间" width="180">
              <template #default="{ row }">
                {{ formatRelativeTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无订单数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'
import * as echarts from 'echarts'

const loading = ref(false)
const salesChartRef = ref(null)
const hotProductsChartRef = ref(null)
let salesChart = null
let hotProductsChart = null

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

// 格式化数字（千分位）
const formatNumber = (num) => {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化金额（保留两位小数）
const formatMoney = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
}

// 格式化相对时间
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await request.get('/admin/statistics')
    stats.totalSales = res.totalSales || 0
    stats.orderCount = res.totalOrders || 0
    stats.userCount = res.totalUsers || 0
    stats.productCount = res.totalProducts || 0
    
    // 更新订单状态统计
    if (res.orderStats) {
      stats.orderStats = res.orderStats
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    const res = await request.get('/admin/orders', {
      params: { page: 1, pageSize: 5 }
    })
    recentOrders.value = res.list || []
  } catch (error) {
    console.error('获取最近订单失败:', error)
    recentOrders.value = []
  }
}

// 获取销售趋势数据
const fetchSalesTrend = async () => {
  try {
    const res = await request.get('/admin/sales-trend')
    if (res && res.length > 0) {
      renderSalesChart(res)
    }
  } catch (error) {
    console.error('获取销售趋势失败:', error)
  }
}

// 获取热销商品数据
const fetchHotProducts = async () => {
  try {
    const res = await request.get('/admin/hot-products')
    if (res && res.length > 0) {
      renderHotProductsChart(res)
    }
  } catch (error) {
    console.error('获取热销商品失败:', error)
  }
}

// 渲染销售趋势图表
const renderSalesChart = (data) => {
  if (!salesChartRef.value) return
  
  if (!salesChart) {
    salesChart = echarts.init(salesChartRef.value)
  }
  
  const dates = data.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const amounts = data.map(item => item.amount)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params) => {
        const item = params[0]
        return `<div style="font-weight:bold;margin-bottom:5px">${item.name}</div>
                <div>销售额: <span style="color:#409eff;font-weight:bold">¥${item.value.toFixed(2)}</span></div>`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666', fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
        color: '#666'
      },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      name: '销售额',
      type: 'line',
      data: amounts,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: true,
      emphasis: {
        focus: 'series',
        itemStyle: { borderWidth: 3, borderColor: '#fff' }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.25)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
          ]
        }
      },
      lineStyle: {
        color: '#409eff',
        width: 3,
        shadowColor: 'rgba(64, 158, 255, 0.3)',
        shadowBlur: 8,
        shadowOffsetY: 4
      },
      itemStyle: {
        color: '#409eff',
        borderColor: '#fff',
        borderWidth: 2
      },
      markPoint: {
        data: [
          {
            type: 'max',
            name: '最高',
            symbol: 'pin',
            symbolSize: 50,
            label: { formatter: '¥{c}', fontSize: 11 },
            itemStyle: { color: '#409eff' }
          }
        ],
        animation: true
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    }],
    grid: {
      left: '60',
      right: '20',
      bottom: '30',
      top: '30'
    }
  }
  
  salesChart.setOption(option)
}

// 渲染热销商品图表
const renderHotProductsChart = (data) => {
  if (!hotProductsChartRef.value) return
  
  if (!hotProductsChart) {
    hotProductsChart = echarts.init(hotProductsChartRef.value)
  }
  
  // 为商品名称添加排名标识
  const names = data.map((item, index) => {
    const rank = index + 1
    const prefix = rank <= 3 ? `🥇🥈🥉`[rank - 1] + ' ' : `${rank}. `
    const name = item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name
    return prefix + name
  })
  
  const sales = data.map(item => item.total_sales)
  
  // 根据排名设置不同颜色
  const colors = data.map((_, index) => {
    if (index === 0) return { start: '#ff6b6b', end: '#ee5a5a' }      // 金色
    if (index === 1) return { start: '#ffa94d', end: '#ff922b' }      // 银色
    if (index === 2) return { start: '#ffd43b', end: '#fcc419' }      // 铜色
    return { start: '#69db7c', end: '#51cf66' }                       // 绿色
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params) => {
        const item = params[0]
        const rank = item.dataIndex + 1
        return `<div style="font-weight:bold;margin-bottom:5px">
                  ${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : ''} 第${rank}名
                </div>
                <div style="margin-bottom:3px">商品: ${data[item.dataIndex].name}</div>
                <div>销量: <span style="color:#67c23a;font-weight:bold">${item.value}件</span></div>`
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        color: '#333',
        fontSize: 12
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      name: '销量',
      type: 'bar',
      data: sales.map((value, index) => ({
        value,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: colors[index].start },
              { offset: 1, color: colors[index].end }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 24,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    }],
    grid: {
      left: '140',
      right: '30',
      bottom: '20',
      top: '10'
    }
  }
  
  hotProductsChart.setOption(option)
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders(),
      fetchSalesTrend(),
      fetchHotProducts()
    ])
  } finally {
    loading.value = false
  }
}

// 获取订单状态类型
const getStatusType = (status) => {
  const map = {
    1: 'warning',   // 待付款
    2: 'success',   // 待发货
    3: 'primary',   // 已发货
    4: 'info',      // 已完成
    5: 'info',      // 已完成
    6: 'danger',    // 已取消
    7: 'danger'     // 已退款
  }
  return map[status] || 'info'
}

// 获取订单状态文本
const getStatusText = (status) => {
  const map = {
    1: '待付款',
    2: '待发货',
    3: '已发货',
    4: '已完成',
    5: '已完成',
    6: '已取消',
    7: '已退款'
  }
  return map[status] || '未知'
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  if (salesChart) salesChart.resize()
  if (hotProductsChart) hotProductsChart.resize()
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders()
    ])
    
    // 等待DOM更新后再渲染图表
    await nextTick()
    await fetchSalesTrend()
    await fetchHotProducts()
  } finally {
    loading.value = false
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  if (salesChart) {
    salesChart.dispose()
    salesChart = null
  }
  if (hotProductsChart) {
    hotProductsChart.dispose()
    hotProductsChart = null
  }
  
  window.removeEventListener('resize', handleResize)
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