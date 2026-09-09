<template>
  <div class="product-list">
    <el-table :data="products" style="width: 100%" v-if="products.length > 0">
      <el-table-column prop="name" label="商品名称" min-width="200" />
      <el-table-column prop="price" label="价格" width="100" align="center">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" align="center" />
      <el-table-column prop="thisWeekSales" label="本周销量" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getSalesType(row.thisWeekSales)" size="small">
            {{ row.thisWeekSales }}件
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="growth" label="增长率" width="100" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.growth >= 0 ? '#67c23a' : '#f56c6c', fontWeight: '600' }">
            {{ row.growth >= 0 ? '+' : '' }}{{ row.growth.toFixed(1) }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="totalSales" label="总销量" width="100" align="center" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewProduct(row.id)">
            查看详情
          </el-button>
          <el-button 
            v-if="type === 'dog'" 
            type="danger" 
            link 
            size="small"
            @click="handlePromotion(row)"
          >
            促销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else description="暂无数据" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'star'
  }
})

const router = useRouter()

const getSalesType = (sales) => {
  if (sales > 20) return 'success'
  if (sales > 10) return 'warning'
  return 'info'
}

const viewProduct = (id) => {
  router.push(`/products?id=${id}`)
}

const handlePromotion = (product) => {
  ElMessage.info(`准备为"${product.name}"创建促销活动`)
  // 这里可以跳转到活动创建页面并预填商品信息
  router.push(`/marketing/activities/new?productId=${product.id}`)
}
</script>

<style scoped lang="scss">
.product-list {
  :deep(.el-table) {
    font-size: 13px;
  }
}
</style>