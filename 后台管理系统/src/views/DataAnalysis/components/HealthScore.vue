<template>
  <el-card class="health-score-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">业务健康度</span>
        <el-tag :type="ratingConfig[data.rating].type" size="large">
          {{ ratingConfig[data.rating].text }}
        </el-tag>
      </div>
    </template>

    <!-- 健康度评分 -->
    <div class="score-section">
      <div class="score-display">
        <div class="score-value" :style="{ color: ratingConfig[data.rating].color }">
          {{ data.score }}
        </div>
        <div class="score-label">分</div>
      </div>
      
      <div class="score-progress">
        <el-progress 
          :percentage="data.score" 
          :color="ratingConfig[data.rating].color"
          :stroke-width="12"
          :show-text="false"
        />
        <div class="score-change">
          <template v-if="scoreChange !== 0">
            <el-icon :style="{ color: scoreChange > 0 ? '#67c23a' : '#f56c6c' }">
              <component :is="scoreChange > 0 ? 'Top' : 'Bottom'" />
            </el-icon>
            <span :style="{ color: scoreChange > 0 ? '#67c23a' : '#f56c6c' }">
              {{ Math.abs(scoreChange).toFixed(1) }}分
            </span>
          </template>
          <span class="change-label">较上周</span>
        </div>
      </div>
    </div>

    <!-- 评分因素 -->
    <div class="factors-section" v-if="data.factors && data.factors.length > 0">
      <div class="factors-title">影响因素</div>
      <div class="factors-list">
        <div 
          v-for="(factor, index) in data.factors" 
          :key="index"
          class="factor-item"
        >
          <el-tag :type="factor.score >= 0 ? 'success' : 'warning'" size="small">
            {{ factor.name }}
          </el-tag>
          <span class="factor-score" :class="{ negative: factor.score < 0 }">
            {{ factor.score > 0 ? '+' : '' }}{{ factor.score }}分
          </span>
          <span class="factor-reason">{{ factor.reason }}</span>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="alerts-section" v-if="alerts && alerts.length > 0">
      <div class="alerts-title">
        <el-icon><WarningFilled /></el-icon>
        待处理事项（{{ alerts.length }}）
      </div>
      <div class="alerts-list">
        <el-alert
          v-for="(alert, index) in alerts"
          :key="index"
          :type="alert.type"
          :closable="false"
          class="alert-item"
        >
          <template #title>
            <div class="alert-content">
              <span class="alert-title">{{ alert.title }}</span>
              <el-button 
                type="primary" 
                size="small" 
                link
                @click="handleAlertAction(alert)"
              >
                {{ alert.actionText }}
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div v-if="alert.details" class="alert-details">
              {{ alert.details }}
            </div>
          </template>
        </el-alert>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Top, Bottom, WarningFilled, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  alerts: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// 评级配置
const ratingConfig = {
  excellent: {
    text: '优秀',
    type: 'success',
    color: '#67c23a'
  },
  good: {
    text: '良好',
    type: 'success',
    color: '#85ce61'
  },
  normal: {
    text: '正常',
    type: 'info',
    color: '#909399'
  },
  warning: {
    text: '预警',
    type: 'warning',
    color: '#e6a23c'
  },
  danger: {
    text: '危险',
    type: 'danger',
    color: '#f56c6c'
  }
}

// 计算分数变化
const scoreChange = computed(() => {
  if (!props.data.lastWeekScore) return 0
  return props.data.score - props.data.lastWeekScore
})

// 处理预警点击
const handleAlertAction = (alert) => {
  if (alert.action) {
    router.push(alert.action)
  }
}
</script>

<style scoped lang="scss">
.health-score-card {
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

  .score-section {
    display: flex;
    gap: 30px;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;

    .score-display {
      display: flex;
      align-items: baseline;
      gap: 5px;

      .score-value {
        font-size: 56px;
        font-weight: bold;
        line-height: 1;
      }

      .score-label {
        font-size: 18px;
        color: #999;
      }
    }

    .score-progress {
      flex: 1;

      .score-change {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 8px;
        font-size: 14px;

        .change-label {
          color: #999;
          margin-left: 5px;
        }
      }
    }
  }

  .factors-section {
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;

    .factors-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      margin-bottom: 12px;
    }

    .factors-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .factor-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: #f9f9f9;
        border-radius: 4px;
        font-size: 13px;

        .factor-score {
          font-weight: 600;
          color: #67c23a;

          &.negative {
            color: #e6a23c;
          }
        }

        .factor-reason {
          color: #666;
          flex: 1;
        }
      }
    }
  }

  .alerts-section {
    padding-top: 20px;

    .alerts-title {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: 600;
      color: #e6a23c;
      margin-bottom: 12px;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .alert-item {
        :deep(.el-alert__content) {
          width: 100%;
        }

        .alert-content {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .alert-title {
            flex: 1;
            font-weight: 500;
          }
        }

        .alert-details {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>