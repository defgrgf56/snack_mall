<template>
  <el-card class="product-matrix-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">商品分析矩阵</span>
        <el-tag type="info" size="small">波士顿矩阵</el-tag>
      </div>
    </template>

    <!-- 矩阵概览 -->
    <el-row :gutter="20" class="matrix-summary">
      <el-col :span="6" :xs="12" :sm="6">
        <div class="summary-item star">
          <div class="icon">⭐</div>
          <div class="count">{{ matrix.summary.starCount }}</div>
          <div class="label">明星商品</div>
        </div>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6">
        <div class="summary-item cash">
          <div class="icon">💰</div>
          <div class="count">{{ matrix.summary.cashCount }}</div>
          <div class="label">现金牛</div>
        </div>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6">
        <div class="summary-item potential">
          <div class="icon">🚀</div>
          <div class="count">{{ matrix.summary.potentialCount }}</div>
          <div class="label">潜力商品</div>
        </div>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6">
        <div class="summary-item dog">
          <div class="icon">⚠️</div>
          <div class="count">{{ matrix.summary.dogCount }}</div>
          <div class="label">滞销品</div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细列表 -->
    <el-tabs v-model="activeTab" class="matrix-tabs">
      <el-tab-pane label="明星商品" name="star">
        <div class="tab-description">高增长 + 高销量，建议加大库存和推广力度</div>
        <ProductList :products="matrix.matrix.star" type="star" />
      </el-tab-pane>
      
      <el-tab-pane label="现金牛" name="cash">
        <div class="tab-description">稳定增长 + 高销量，建议保持现状</div>
        <ProductList :products="matrix.matrix.cash" type="cash" />
      </el-tab-pane>
      
      <el-tab-pane label="潜力商品" name="potential">
        <div class="tab-description">高增长 + 低销量，建议加大曝光和营销投入</div>
        <ProductList :products="matrix.matrix.potential" type="potential" />
      </el-tab-pane>
      
      <el-tab-pane label="滞销品" name="dog">
        <div class="tab-description">低增长 + 低销量，建议促销或下架</div>
        <ProductList :products="matrix.matrix.dog" type="dog" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import ProductList from './ProductList.vue'

defineProps({
  matrix: {
    type: Object,
    required: true
  }
})

const activeTab = ref('star')
</script>

<style scoped lang="scss">
.product-matrix-card {
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

  .matrix-summary {
    margin-bottom: 20px;

    .summary-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-3px);
      }

      .icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .count {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .label {
        font-size: 13px;
        color: #666;
      }

      &.star {
        background: linear-gradient(135deg, #fff8e1 0%, #fff 100%);
        .count { color: #f9a825; }
      }

      &.cash {
        background: linear-gradient(135deg, #e8f5e9 0%, #fff 100%);
        .count { color: #66bb6a; }
      }

      &.potential {
        background: linear-gradient(135deg, #e3f2fd 0%, #fff 100%);
        .count { color: #42a5f5; }
      }

      &.dog {
        background: linear-gradient(135deg, #fce4ec 0%, #fff 100%);
        .count { color: #ef5350; }
      }
    }
  }

  .matrix-tabs {
    .tab-description {
      padding: 10px 15px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 13px;
      color: #666;
      margin-bottom: 15px;
    }
  }
}
</style>