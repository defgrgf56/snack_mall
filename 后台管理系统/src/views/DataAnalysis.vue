<template>
  <div class="data-analysis-container" v-loading="loading">
    <!-- 页面标题 -->
    <el-row class="header-row">
      <el-col :span="12">
        <h2 class="page-title">数据分析</h2>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </el-col>
    </el-row>

    <!-- 业务健康度监控 -->
    <HealthScore 
      v-if="analyticsData.healthScore" 
      :data="analyticsData.healthScore"
      :alerts="analyticsData.alerts"
    />

    <!-- 智能数据对比分析 -->
    <CompareCard 
      v-if="analyticsData.comparison" 
      :comparison="analyticsData.comparison"
      :trend="analyticsData.trend"
    />

    <!-- 商品分析矩阵 -->
    <ProductMatrix v-if="productMatrix" :matrix="productMatrix" />

    <!-- 更新时间 -->
    <div class="update-time" v-if="analyticsData.updatedAt">
      最后更新：{{ formatTime(analyticsData.updatedAt) }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import HealthScore from './DataAnalysis/components/HealthScore.vue'
import CompareCard from './DataAnalysis/components/CompareCard.vue'
import ProductMatrix from './DataAnalysis/components/ProductMatrix.vue'

const loading = ref(false)
const analyticsData = reactive({
  healthScore: null,
  alerts: [],
  comparison: null,
  trend: null,
  updatedAt: null
})
const productMatrix = ref(null)

// 获取综合分析数据
const fetchAnalyticsData = async () => {
  try {
    const res = await request.get('/admin/analytics/overview')
    analyticsData.healthScore = res.healthScore
    analyticsData.alerts = res.alerts || []
    analyticsData.comparison = res.comparison
    analyticsData.trend = res.trend
    analyticsData.updatedAt = res.updatedAt
  } catch (error) {
    console.error('获取分析数据失败:', error)
    ElMessage.error('获取分析数据失败')
  }
}

// 获取商品矩阵数据
const fetchProductMatrix = async () => {
  try {
    const res = await request.get('/admin/analytics/product-matrix')
    productMatrix.value = res
  } catch (error) {
    console.error('获取商品矩阵失败:', error)
  }
}

// 刷新所有数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchAnalyticsData(),
      fetchProductMatrix()
    ])
    ElMessage.success('数据已刷新')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchAnalyticsData(),
      fetchProductMatrix()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.data-analysis-container {
  .header-row {
    margin-bottom: 20px;
    align-items: center;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  .update-time {
    text-align: right;
    color: #999;
    font-size: 13px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }
}
</style>