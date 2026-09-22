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
      <!-- 销售趋势 -->
      <el-col :span="12" :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">销售趋势（最近7天）</span>
                <span class="card-subtitle">单位：元 | 统计维度：销售额</span>
              </div>
            </div>
          </template>
          <!-- 指标小卡片 -->
          <div class="chart-indicators">
            <div class="indicator-item">
              <div class="indicator-value">¥{{ formatMoney(salesTrendStats.totalSales) }}</div>
              <div class="indicator-label">总销售额</div>
            </div>
            <div class="indicator-item">
              <div class="indicator-value">¥{{ formatMoney(salesTrendStats.dailyAvg) }}</div>
              <div class="indicator-label">日均销售额</div>
            </div>
          </div>
          <!-- 图表或空状态 -->
          <div v-if="hasSalesData" ref="salesChartRef" class="chart-container"></div>
          <div v-else class="chart-empty">
            <el-empty description="近 7 天暂无销售数据" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 热销商品 -->
      <el-col :span="12" :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">热销商品 TOP10</span>
                <span class="card-subtitle">按销量倒序</span>
              </div>
            </div>
          </template>
          <!-- 指标小卡片 -->
          <div class="chart-indicators">
            <div class="indicator-item">
              <div class="indicator-value">{{ formatNumber(hotProductsStats.totalSales) }} 件</div>
              <div class="indicator-label">TOP10 合计销量</div>
            </div>
          </div>
          <!-- 图表或空状态 -->
          <div v-if="hasHotProductsData" ref="hotProductsChartRef" class="chart-container"></div>
          <div v-else class="chart-empty">
            <el-empty description="暂无热销商品数据" :image-size="80" />
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

// 数据状态
const hasSalesData = ref(false)
const hasHotProductsData = ref(false)
let salesRawData = []
let hotProductsRawData = []

// 销售趋势统计
const salesTrendStats = reactive({
  totalSales: 0,
  dailyAvg: 0
})

// 热销商品统计
const hotProductsStats = reactive({
  totalSales: 0
})

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
  if (!num && num !== 0) return '0.00'
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
    salesRawData = res || []
    
    // 计算统计指标
    const totalSales = res.reduce((sum, item) => sum + (item.amount || 0), 0)
    const daysWithData = res.filter(item => item.amount > 0).length || 7
    salesTrendStats.totalSales = totalSales
    salesTrendStats.dailyAvg = totalSales / daysWithData
    
    // 判断是否有数据
    hasSalesData.value = totalSales > 0
    
    if (hasSalesData.value) {
      await nextTick()
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
    hotProductsRawData = res || []
    
    // 计算统计指标
    const totalSales = res.reduce((sum, item) => sum + (item.total_sales || 0), 0)
    hotProductsStats.totalSales = totalSales
    
    // 判断是否有数据
    hasHotProductsData.value = totalSales > 0
    
    if (hasHotProductsData.value) {
      await nextTick()
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
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: (params) => {
        const item = params[0]
        const date = data[item.dataIndex].date
        return `<div style="font-weight:600;margin-bottom:6px;color:#333">${item.name}</div>
                <div style="color:#666">销售额：<span style="color:#409eff;font-weight:600">¥${item.value.toFixed(2)}</span></div>`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#888', fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: {
        formatter: (value) => value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value,
        color: '#888'
      },
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      name: '销售额',
      type: 'line',
      data: amounts,
      smooth: 0.3,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      emphasis: {
        focus: 'series',
        itemStyle: { borderWidth: 2, borderColor: '#fff' }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.15)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.01)' }
          ]
        }
      },
      lineStyle: {
        color: '#409eff',
        width: 2
      },
      itemStyle: {
        color: '#409eff',
        borderColor: '#fff',
        borderWidth: 2
      },
      animationDuration: 800,
      animationEasing: 'cubicOut'
    }],
    grid: {
      left: '50',
      right: '20',
      bottom: '25',
      top: '15'
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
  
  // 商品名称：超过12字截断
  const names = data.map(item => {
    return item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name
  })
  
  const sales = data.map(item => item.total_sales)
  const maxSales = Math.max(...sales)
  
  // 单色渐变：TOP1最深，TOP10最浅
  const getColor = (index, total) => {
    const ratio = index / Math.max(total - 1, 1)
    // 从深到浅的渐变（品牌蓝色系）
    const r = Math.round(64 + ratio * 60)
    const g = Math.round(158 - ratio * 50)
    const b = Math.round(255 - ratio * 80)
    return `rgb(${r}, ${g}, ${b})`
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: (params) => {
        const item = params[0]
        const rank = item.dataIndex + 1
        return `<div style="font-weight:600;margin-bottom:6px;color:#333">第 ${rank} 名</div>
                <div style="color:#666;margin-bottom:4px">商品：${data[item.dataIndex].name}</div>
                <div style="color:#666">销量：<span style="color:#409eff;font-weight:600">${item.value} 件</span></div>`
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#888', fontSize: 11 },
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
        fontSize: 12,
        width: 110,
        overflow: 'truncate'
      },
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: true
    },
    series: [{
      name: '销量',
      type: 'bar',
      data: sales.map((value, index) => ({
        value,
        label: {
          show: true,
          position: 'right',
          formatter: `${value} 件`,
          color: '#666',
          fontSize: 12
        },
        itemStyle: {
          color: getColor(index, data.length),
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 20,
      emphasis: {
        itemStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.15)'
        }
      },
      animationDuration: 800,
      animationEasing: 'cubicOut'
    }],
    grid: {
      left: '130',
      right: '60',
      bottom: '35',
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
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'info',
    5: 'info',
    6: 'danger',
    7: 'danger'
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
    
    await nextTick()
    await fetchSalesTrend()
    await fetchHotProducts()
  } finally {
    loading.value = false
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
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
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
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
        color: var(--text-regular);
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
  }

  .card-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .card-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
  }

  .card-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: normal;
  }

  .chart-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light);
    }

    :deep(.el-card__body) {
      padding: 16px 20px;
    }
  }

  .chart-indicators {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: var(--search-bg);
    border-radius: 8px;

    .indicator-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .indicator-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .indicator-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }

  .chart-container {
    height: 260px;
  }

  .chart-empty {
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--search-bg);
    border-radius: 8px;
  }
}
</style>