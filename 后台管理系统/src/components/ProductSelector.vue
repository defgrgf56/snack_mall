<template>
  <div>
    <!-- 触发按钮 -->
    <div class="selector-trigger">
      <div v-if="selectedProduct" class="selected-product">
        <el-image
          :src="selectedProduct.cover"
          style="width: 60px; height: 60px; border-radius: 4px"
          fit="cover"
        />
        <div class="product-info">
          <div class="product-name">{{ selectedProduct.name }}</div>
          <div class="product-meta">
            原价: ¥{{ selectedProduct.price }} | 库存: {{ selectedProduct.stock }}
          </div>
        </div>
        <el-button type="primary" link @click="dialogVisible = true">
          更换商品
        </el-button>
      </div>
      <el-button v-else type="primary" @click="dialogVisible = true">
        选择商品
      </el-button>
    </div>

    <!-- 选择弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="选择商品"
      width="900px"
      :close-on-click-modal="false"
    >
      <!-- 搜索筛选 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品名称"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="categoryFilter"
          placeholder="商品分类"
          clearable
          style="width: 200px; margin-left: 10px"
          @change="handleFilter"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </div>

      <!-- 商品列表 -->
      <div class="product-list" v-loading="loading">
        <div
          v-for="product in productList"
          :key="product.id"
          class="product-item"
          :class="{ selected: tempSelected?.id === product.id }"
          @click="handleSelectProduct(product)"
        >
          <el-image
            :src="product.cover"
            style="width: 80px; height: 80px; border-radius: 4px"
            fit="cover"
          />
          <div class="product-details">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-stock">库存: {{ product.stock }}</div>
          </div>
          <el-icon v-if="tempSelected?.id === product.id" class="check-icon">
            <CircleCheck />
          </el-icon>
        </div>
        <el-empty v-if="!loading && productList.length === 0" description="暂无商品" />
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchProducts"
          @current-change="fetchProducts"
        />
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!tempSelected">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, CircleCheck } from '@element-plus/icons-vue'
import { getProductList } from '@/api/product'
import { getCategoryList } from '@/api/category'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const dialogVisible = ref(false)
const loading = ref(false)
const productList = ref([])
const categories = ref([])
const selectedProduct = ref(props.product)
const tempSelected = ref(null)

const searchQuery = ref('')
const categoryFilter = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索防抖
let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 500)
}

// 筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchProducts()
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      status: 1, // 只显示已上架商品
      keyword: searchQuery.value || undefined,
      category_id: categoryFilter.value || undefined
    }
    
    const res = await getProductList(params)
    // 兼容两种返回格式：{ list, pagination: { total } } 或 { list, total }
    productList.value = res?.list || []
    total.value = res?.pagination?.total || res?.total || 0
  } catch (error) {
    console.error('获取商品列表失败:', error)
    productList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res?.list || res || []
  } catch (error) {
    console.error('获取分类失败:', error)
    categories.value = []
  }
}

// 选择商品
const handleSelectProduct = (product) => {
  tempSelected.value = product
}

// 确认选择
const handleConfirm = () => {
  if (tempSelected.value) {
    selectedProduct.value = tempSelected.value
    emit('update:modelValue', tempSelected.value.id)
    emit('change', tempSelected.value)
    dialogVisible.value = false
  }
}

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    tempSelected.value = selectedProduct.value
    fetchProducts()
    fetchCategories()
  }
})

// 监听外部传入的product
watch(() => props.product, (val) => {
  selectedProduct.value = val
}, { immediate: true })
</script>

<style scoped>
.selector-trigger {
  width: 100%;
}

.selected-product {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  gap: 12px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-meta {
  font-size: 12px;
  color: #909399;
}

.search-bar {
  margin-bottom: 16px;
}

.product-list {
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  gap: 12px;
}

.product-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.product-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.product-details {
  flex: 1;
}

.product-details .product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.product-details .product-price {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 4px;
}

.product-details .product-stock {
  font-size: 12px;
  color: #909399;
}

.check-icon {
  font-size: 24px;
  color: #409eff;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>