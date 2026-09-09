<template>
  <el-card class="compare-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">智能数据对比</span>
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="daily">今日 vs 昨日</el-radio-button>
          <el-radio-button label="weekly">本周 vs 上周</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <!-- 对比数据卡片 -->
    <el-row :gutter="20" class="compare-row">
      <!-- 销售额对比 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <div class="compare-item">
          <div class="item-header">
            <el-icon class="item-icon" :style="{ color: '#409eff' }">
              <Money />
            </el-icon>
            <span class="item-title">销售额对比</span>
          </div>
          <div class="item-content">
            <div class="current-value">
              <span class="label">{{ timeRange === 'daily' ? '今日' : '本周' }}</span>
              <span class="value">¥{{ formatMoney(currentData.sales) }}</span>
            </div>
            <div class="previous-value">
              <span class="label">{{ timeRange === 'daily' ? '昨日' : '上周' }}</span>
              <span class="value">¥{{ formatMoney(previousData.sales) }}</span>
            </div>
            <div class="growth" :class="growthClass(salesGrowth)">
              <el-icon>
                <component :is="salesGrowth >= 0 ? 'CaretTop' : 'CaretBottom'" />
              </el-icon>
              <span>{{ Math.abs(salesGrowth).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 订单量对比 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <div class="compare-item">
          <div class="item-header">
            <el-icon class="item-icon" :style="{ color: '#67c23a' }">
              <ShoppingCart />
            </el-icon>
            <span class="item-title">订单量对比</span>
          </div>
          <div class="item-content">
            <div class="current-value">
              <span class="label">{{ timeRange === 'daily' ? '今日' : '本周' }}</span>
              <span class="value">{{ currentData.orders }}单</span>
            </div>
            <div class="previous-value">
              <span class="label">{{ timeRange === 'daily' ? '昨日' : '上周' }}</span>
              <span class="value">{{ previousData.orders }}单</span>
            </div>
            <div class="growth" :class="growthClass(ordersGrowth)">
              <el-icon>
                <component :is="ordersGrowth >= 0 ? 'CaretTop' : 'CaretBottom'" />
              </el-icon>
              <span>{{ Math.abs(ordersGrowth).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 客单价对比 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <div class="compare-item">
          <div class="item-header">
            <el-icon class="item-icon" :style="{ color: '#e6a23c' }">
              <TrendCharts />
            </el-icon>
            <span class="item-title">客单价对比</span>
          </div>
          <div class="item-content">
            <div class="current-value">
              <span class="label">{{ timeRange === 'daily' ? '今日' : '本周' }}</span>
              <span class="value">¥{{ formatMoney(currentData.avgPrice) }}</span>
            </div>
            <div class="previous-value">
              <span class="label">{{ timeRange === 'daily' ? '昨日' : '上周' }}</span>
              <span class="value">¥{{ formatMoney(previousData.avgPrice) }}</span>
            </div>
            <div class="growth" :class="growthClass(avgPriceGrowth)">
              <el-icon>
                <component :is="avgPriceGrowth >= 0 ? 'CaretTop' : 'CaretBottom'" />
              </el-icon>
              <span>{{ Math.abs(avgPriceGrowth).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 趋势判断 -->
    <div class="trend-section" v-if="trend && trend.suggestions">
      <div class="trend-header">
        <el-icon :style="{ color: trendConfig[trend.overall].color }">
          <component :is="trendConfig[trend.overall].icon" />
        </el-icon>
        <span class="trend-title">趋势判断</span>
      </div>
      <div class="trend-suggestions">
        <el-alert
          v-for="(suggestion, index) in trend.suggestions"
          :key="index"
          :type="suggestion.type"
          :closable="false"
          show-icon
        >
          {{ suggestion.text }}
        </el-alert>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Money, ShoppingCart, TrendCharts, CaretTop, CaretBottom, SuccessFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps({
  comparison: {
    type: Object,
    required: true
  },
  trend: {
    type: Object,
    default: null
  }
})

const timeRange = ref('weekly')

// 趋势配置
const trendConfig = {
  positive: {
    icon: SuccessFilled,
    color: '#67c23a'
  },
  warning: {
    icon: WarningFilled,
    color: '#e6a23c'
  },
  negative: {
    icon: CircleCloseFilled,
    color: '#f56c6c'
  }
}

// 当前数据
const currentData = computed(() => {
  if (timeRange.value === 'daily') {
    return {
      sales: props.comparison.daily.sales.today || 0,
      orders: props.comparison.daily.orders.today || 0,
      avgPrice: props.comparison.daily.orders.today > 0 
        ? props.comparison.daily.sales.today / props.comparison.daily.orders.today 
        : 0
    }
  } else {
    return {
      sales: props.comparison.weekly.sales.current || 0,
      orders: props.comparison.weekly.orders.current || 0,
      avgPrice: props.comparison.weekly.avgPrice.current || 0
    }
  }
})

// 对比数据
const previousData = computed(() => {
  if (timeRange.value === 'daily') {
    return {
      sales: props.comparison.daily.sales.yesterday || 0,
      orders: props.comparison.daily.orders.yesterday || 0,
      avgPrice: props.comparison.daily.orders.yesterday > 0 
        ? props.comparison.daily.sales.yesterday / props.comparison.daily.orders.yesterday 
        : 0
    }
  } else {
    return {
      sales: props.comparison.weekly.sales.previous || 0,
      orders: props.comparison.weekly.orders.previous || 0,
      avgPrice: props.comparison.weekly.avgPrice.previous || 0
    }
  }
})

// 增长率
const salesGrowth = computed(() => {
  if (timeRange.value === 'daily') {
    return props.comparison.daily.sales.growth || 0
  }
  return props.comparison.weekly.sales.growth || 0
})

const ordersGrowth = computed(() => {
  if (timeRange.value === 'daily') {
    return props.comparison.daily.orders.growth || 0
  }
  return props.comparison.weekly.orders.growth || 0
})

const avgPriceGrowth = computed(() => {
  if (timeRange.value === 'daily') {
    const prev = previousData.value.avgPrice
    const curr = currentData.value.avgPrice
    return prev > 0 ? ((curr - prev) / prev) * 100 : 0
  }
  return props.comparison.weekly.avgPrice.growth || 0
})

// 格式化金额
const formatMoney = (num) => {
  if (!num && num !== 0) return '0.00'
  return parseFloat(num).toFixed(2)
}

// 增长样式
const growthClass = (growth) => {
  if (growth > 0) return 'positive'
  if (growth < 0) return 'negative'
  return 'neutral'
}
</script>

<style scoped lang="scss">
.compare-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .compare-row {
    margin-bottom: 20px;
  }

  .compare-item {
    padding: 20px;
    background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
    border-radius: 8px;
    border: 1px solid #eee;
    height: 100%;

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .item-icon {
        font-size: 20px;
      }

      .item-title {
        font-size: 14px;
        font-weight: 500;
        color: #666;
      }
    }

    .item-content {
      .current-value,
      .previous-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .label {
          font-size: 13px;
          color: #999;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }

      .previous-value {
        padding-bottom: 12px;
        border-bottom: 1px dashed #eee;

        .value {
          font-size: 14px;
          color: #999;
          font-weight: normal;
        }
      }

      .growth {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-top: 12px;
        font-size: 16px;
        font-weight: 600;

        &.positive {
          color: #67c23a;
        }

        &.negative {
          color: #f56c6c;
        }

        &.neutral {
          color: #909399;
        }
      }
    }
  }

  .trend-section {
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;

    .trend-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;

      .trend-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .trend-suggestions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
}

@media (max-width: 768px) {
  .compare-row {
    .el-col {
      margin-bottom: 15px;
    }
  }
}
</style>