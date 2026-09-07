<template>
  <div class="activity-list">
    <el-card>
      <!-- 搜索筛选 -->
      <el-form :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="活动标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入活动标题"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select
            v-model="searchForm.type"
            placeholder="全部"
            clearable
            style="width: 150px;"
          >
            <el-option label="节日促销" value="festival" />
            <el-option label="新人专享" value="newbie" />
            <el-option label="会员专区" value="vip" />
            <el-option label="拼团活动" value="group" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 120px;"
          >
            <el-option label="进行中" :value="1" />
            <el-option label="未开始" :value="2" />
            <el-option label="已结束" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建活动
        </el-button>
      </div>

      <!-- 活动列表 -->
      <el-table
        v-loading="loading"
        :data="activityList"
        stripe
        style="width: 100%"
      >
        <el-table-column label="活动信息" width="300">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-image
                :src="row.cover"
                style="width: 80px; height: 80px; margin-right: 12px; border-radius: 4px;"
                fit="cover"
              />
              <div>
                <div style="font-weight: 500; margin-bottom: 4px;">{{ row.title }}</div>
                <div style="font-size: 12px; color: #999;">{{ row.subtitle }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getActivityTypeTag(row.type)">
              {{ getActivityTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间范围" width="320">
          <template #default="{ row }">
            <div style="font-size: 13px;">
              <div>开始：{{ formatDateTime(row.start_time) }}</div>
              <div>结束：{{ formatDateTime(row.end_time) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleManageProducts(row)"
            >
              商品管理
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status !== 0"
              type="warning"
              link
              size="small"
              @click="handleUpdateStatus(row, 0)"
            >
              结束
            </el-button>
            <el-popconfirm
              title="确定删除该活动吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  link
                  size="small"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 商品管理弹窗 -->
    <el-dialog
      v-model="productDialogVisible"
      title="活动商品管理"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentActivity">
        <!-- 添加商品 -->
        <div style="margin-bottom: 20px;">
          <el-button type="primary" @click="showAddProductDialog">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>

        <!-- 商品列表 -->
        <el-table
          v-loading="productLoading"
          :data="activityProducts"
          stripe
        >
          <el-table-column label="商品信息" width="300">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-image
                  :src="row.product?.cover"
                  style="width: 60px; height: 60px; margin-right: 12px; border-radius: 4px;"
                  fit="cover"
                />
                <div>
                  <div style="font-weight: 500;">{{ row.product?.name }}</div>
                  <div style="font-size: 12px; color: #999;">ID: {{ row.product_id }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="原价" width="100">
            <template #default="{ row }">
              ¥{{ row.product?.price }}
            </template>
          </el-table-column>
          <el-table-column label="折扣" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.discount"
                :min="0.1"
                :max="10"
                :step="0.1"
                :precision="1"
                size="small"
                @change="handleUpdateProduct(row)"
              />
              <span style="margin-left: 4px;">折</span>
            </template>
          </el-table-column>
          <el-table-column label="特价" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.special_price"
                :min="0.01"
                :precision="2"
                size="small"
                @change="handleUpdateProduct(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="活动价" width="100">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 500;">
                ¥{{ getActivityPrice(row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.sort"
                :min="0"
                size="small"
                @change="handleUpdateProduct(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-popconfirm
                title="确定移除该商品吗？"
                @confirm="handleRemoveProduct(row)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    size="small"
                  >
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加商品弹窗 -->
    <el-dialog
      v-model="addProductDialogVisible"
      title="选择商品"
      width="70%"
      :close-on-click-modal="false"
    >
      <!-- 商品搜索 -->
      <el-form :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="商品名称">
          <el-input
            v-model="productSearch.name"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px;"
            @keyup.enter="loadAvailableProducts"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAvailableProducts">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 可选商品列表 -->
      <el-table
        v-loading="availableProductLoading"
        :data="availableProducts"
        @selection-change="handleProductSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品信息">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-image
                :src="row.cover"
                style="width: 60px; height: 60px; margin-right: 12px; border-radius: 4px;"
                fit="cover"
              />
              <div>
                <div style="font-weight: 500;">{{ row.name }}</div>
                <div style="font-size: 12px; color: #999;">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="80" />
        <el-table-column label="销量" prop="sales" width="80" />
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="productPagination.page"
          v-model:page-size="productPagination.pageSize"
          :total="productPagination.total"
          layout="total, prev, pager, next"
          @current-change="loadAvailableProducts"
        />
      </div>

      <template #footer>
        <el-button @click="addProductDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedProducts.length === 0"
          @click="handleBatchAddProducts"
        >
          确定添加 ({{ selectedProducts.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getActivityList, deleteActivity, updateActivityStatus, getActivityProducts, addActivityProduct, removeActivityProduct, batchAddActivityProducts, updateActivityProduct } from '@/api/activity'
import { getProductList } from '@/api/product'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  status: ''
})

// 活动列表
const loading = ref(false)
const activityList = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 商品管理
const productDialogVisible = ref(false)
const currentActivity = ref(null)
const productLoading = ref(false)
const activityProducts = ref([])

// 添加商品
const addProductDialogVisible = ref(false)
const availableProductLoading = ref(false)
const availableProducts = ref([])
const selectedProducts = ref([])
const productSearch = reactive({
  name: ''
})
const productPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取活动列表
async function loadActivityList() {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    const res = await getActivityList(params)
    activityList.value = res.list || []
    pagination.total = res.pagination?.total || 0
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error(error.message || '获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadActivityList()
}

// 重置
function handleReset() {
  Object.assign(searchForm, {
    title: '',
    type: '',
    status: ''
  })
  pagination.page = 1
  loadActivityList()
}

// 新建活动
function handleAdd() {
  router.push('/activities/create')
}

// 编辑活动
function handleEdit(row) {
  router.push(`/activities/${row.id}/edit`)
}

// 删除活动
async function handleDelete(row) {
  try {
    await deleteActivity(row.id)
    ElMessage.success('删除成功')
    loadActivityList()
  } catch (error) {
    console.error('删除活动失败:', error)
    ElMessage.error(error.message || '删除失败')
  }
}

// 更新状态
async function handleUpdateStatus(row, status) {
  try {
    await updateActivityStatus(row.id, status)
    ElMessage.success('更新成功')
    loadActivityList()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error(error.message || '更新失败')
  }
}

// 管理商品
async function handleManageProducts(row) {
  currentActivity.value = row
  productDialogVisible.value = true
  await loadActivityProducts()
}

// 加载活动商品
async function loadActivityProducts() {
  if (!currentActivity.value) return
  
  try {
    productLoading.value = true
    const res = await getActivityProducts(currentActivity.value.id, {
      page: 1,
      pageSize: 100
    })
    activityProducts.value = res.list || []
  } catch (error) {
    console.error('获取活动商品失败:', error)
    ElMessage.error(error.message || '获取活动商品失败')
  } finally {
    productLoading.value = false
  }
}

// 显示添加商品弹窗
function showAddProductDialog() {
  addProductDialogVisible.value = true
  productSearch.name = ''
  productPagination.page = 1
  loadAvailableProducts()
}

// 加载可选商品
async function loadAvailableProducts() {
  try {
    availableProductLoading.value = true
    const params = {
      name: productSearch.name,
      page: productPagination.page,
      pageSize: productPagination.pageSize
    }
    
    const res = await getProductList(params)
    availableProducts.value = res.list || []
    productPagination.total = res.pagination?.total || 0
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    availableProductLoading.value = false
  }
}

// 商品选择变化
function handleProductSelectionChange(selection) {
  selectedProducts.value = selection
}

// 批量添加商品
async function handleBatchAddProducts() {
  if (!currentActivity.value || selectedProducts.value.length === 0) {
    return
  }
  
  try {
    const products = selectedProducts.value.map(p => ({
      product_id: p.id,
      discount: 10,
      sort: 0
    }))
    
    await batchAddActivityProducts(currentActivity.value.id, { products })
    ElMessage.success('添加成功')
    addProductDialogVisible.value = false
    await loadActivityProducts()
  } catch (error) {
    console.error('添加商品失败:', error)
    ElMessage.error(error.message || '添加失败')
  }
}

// 更新活动商品
async function handleUpdateProduct(row) {
  if (!currentActivity.value) return
  
  try {
    await updateActivityProduct(currentActivity.value.id, row.product_id, {
      discount: row.discount,
      special_price: row.special_price,
      sort: row.sort
    })
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新商品失败:', error)
    ElMessage.error(error.message || '更新失败')
  }
}

// 移除商品
async function handleRemoveProduct(row) {
  if (!currentActivity.value) return
  
  try {
    await removeActivityProduct(currentActivity.value.id, row.product_id)
    ElMessage.success('移除成功')
    await loadActivityProducts()
  } catch (error) {
    console.error('移除商品失败:', error)
    ElMessage.error(error.message || '移除失败')
  }
}

// 计算活动价格
function getActivityPrice(row) {
  if (row.special_price) {
    return row.special_price.toFixed(2)
  }
  if (row.discount && row.product?.price) {
    return (row.product.price * row.discount / 10).toFixed(2)
  }
  return row.product?.price || 0
}

// 获取活动类型文本
function getActivityTypeText(type) {
  const map = {
    festival: '节日促销',
    newbie: '新人专享',
    vip: '会员专区',
    group: '拼团活动'
  }
  return map[type] || type
}

// 获取活动类型标签
function getActivityTypeTag(type) {
  const map = {
    festival: 'danger',
    newbie: 'success',
    vip: 'warning',
    group: 'primary'
  }
  return map[type] || ''
}

// 获取状态文本
function getStatusText(status) {
  const map = {
    0: '已结束',
    1: '进行中',
    2: '未开始'
  }
  return map[status] || ''
}

// 获取状态标签
function getStatusTag(status) {
  const map = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return map[status] || ''
}

// 格式化日期时间
function formatDateTime(datetime) {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 分页大小改变
function handleSizeChange() {
  pagination.page = 1
  loadActivityList()
}

// 页码改变
function handlePageChange() {
  loadActivityList()
}

// 初始化
onMounted(() => {
  loadActivityList()
})
</script>

<style scoped>
.activity-list {
  padding: 20px;
}
</style>