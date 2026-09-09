<template>
  <div class="activity-list">
    <el-card>
      <!-- 关键指标卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ stats.ongoing }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.upcoming }}</div>
          <div class="stat-label">未开始</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.ended }}</div>
          <div class="stat-label">已结束</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalProducts }}</div>
          <div class="stat-label">关联商品</div>
        </div>
      </div>

      <!-- 搜索筛选 -->
      <el-form :inline="true" style="margin: 20px 0;">
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
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
            clearable
          />
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
        <el-button 
          v-if="selectedActivities.length > 0"
          type="danger" 
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedActivities.length }})
        </el-button>
      </div>

      <!-- 活动列表 -->
      <el-table
        v-loading="loading"
        :data="activityList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="活动信息" width="320">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-image
                :src="row.cover"
                style="width: 100px; height: 75px; margin-right: 12px; border-radius: 8px; object-fit: cover;"
                fit="cover"
                :preview-src-list="[row.cover]"
              />
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; margin-bottom: 6px; font-size: 14px;">{{ row.title }}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <el-tag :type="getActivityTypeTag(row.type)" size="small">
                    {{ getActivityTypeIcon(row.type) }} {{ getActivityTypeText(row.type) }}
                  </el-tag>
                  <el-tag :type="getStatusTag(row.dynamicStatus)" size="small">
                    {{ getStatusText(row.dynamicStatus) }}
                  </el-tag>
                </div>
                <div style="font-size: 12px; color: #909399;">
                  <el-icon><Box /></el-icon> 
                  {{ row.productCount || 0 }} 个商品
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间状态" width="220">
          <template #default="{ row }">
            <div style="font-size: 13px; line-height: 1.6;">
              <!-- 进行中：显示倒计时 -->
              <div v-if="row.dynamicStatus === 1" style="color: #67c23a; font-weight: 500;">
                <el-icon><Clock /></el-icon>
                {{ getCountdownText(row) }}
              </div>
              <!-- 未开始：显示距开始时间 -->
              <div v-else-if="row.dynamicStatus === 2" style="color: #e6a23c; font-weight: 500;">
                <el-icon><Clock /></el-icon>
                {{ getStartCountdownText(row) }}
              </div>
              <!-- 已结束 -->
              <div v-else style="color: #909399;">
                <el-icon><CircleClose /></el-icon>
                {{ getEndText(row) }}
              </div>
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">
                {{ formatDateShort(row.start_time) }} ~ {{ formatDateShort(row.end_time) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleManageProducts(row)"
              >
                <el-icon><Goods /></el-icon>
                商品
              </el-button>
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleMoreAction(cmd, row)">
                <el-button type="info" link size="small">
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="copy">
                      <el-icon><CopyDocument /></el-icon>
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item 
                      v-if="row.dynamicStatus !== 0" 
                      command="end"
                    >
                      <el-icon><CircleClose /></el-icon>
                      结束活动
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      <span style="color: #f56c6c;">删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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
          <el-table-column label="商品信息" width="320">
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
          <el-table-column label="原价" width="80" align="center">
            <template #default="{ row }">
              <span style="color: #909399;">¥{{ row.product?.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="活动价设置" width="280">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- 按折扣 -->
                <div style="display: flex; align-items: center;">
                  <el-radio 
                    :model-value="row.priceMode || 'discount'" 
                    label="discount"
                    @change="handlePriceModeChange(row, 'discount')"
                  >
                    按折扣
                  </el-radio>
                  <el-input-number
                    v-model="row.discount"
                    :min="0.1"
                    :max="10"
                    :step="0.1"
                    :precision="1"
                    size="small"
                    style="width: 100px; margin-left: 8px;"
                    :disabled="row.priceMode === 'special'"
                    @change="handleDiscountChange(row)"
                  />
                  <span style="margin-left: 4px;">折</span>
                </div>
                <!-- 按特价 -->
                <div style="display: flex; align-items: center;">
                  <el-radio 
                    :model-value="row.priceMode || 'discount'" 
                    label="special"
                    @change="handlePriceModeChange(row, 'special')"
                  >
                    按特价
                  </el-radio>
                  <el-input-number
                    v-model="row.special_price"
                    :min="0.01"
                    :precision="2"
                    size="small"
                    style="width: 120px; margin-left: 8px;"
                    :disabled="row.priceMode === 'discount' || !row.priceMode"
                    @change="handleSpecialPriceChange(row)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最终价格" width="100" align="center">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="color: #f56c6c; font-weight: 600; font-size: 16px;">
                  ¥{{ getActivityPrice(row) }}
                </span>
                <span v-if="row.product?.price" style="font-size: 12px; color: #909399; text-decoration: line-through;">
                  ¥{{ row.product.price }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="100" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.sort"
                :min="0"
                size="small"
                style="width: 80px;"
                @change="handleUpdateProduct(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="80" align="center">
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Clock, CircleClose, Box, Goods, Edit, CopyDocument, ArrowDown } from '@element-plus/icons-vue'
import { getActivityList, deleteActivity, updateActivityStatus, getActivityProducts, addActivityProduct, removeActivityProduct, batchAddActivityProducts, updateActivityProduct } from '@/api/activity'
import { getProductList } from '@/api/product'

const router = useRouter()
const route = useRoute()

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  status: '',
  dateRange: null
})

// 活动列表
const loading = ref(false)
const activityList = ref([])
const selectedActivities = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 统计数据 - 使用后端返回的全局统计
const stats = reactive({
  ongoing: 0,
  upcoming: 0,
  ended: 0,
  totalProducts: 0
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

// 计算动态状态
function calculateDynamicStatus(activity) {
  const now = new Date().getTime()
  const start = new Date(activity.start_time).getTime()
  const end = new Date(activity.end_time).getTime()
  
  if (now < start) return 2 // 未开始
  if (now > end) return 0 // 已结束
  return 1 // 进行中
}

// 获取倒计时文本（进行中）
function getCountdownText(activity) {
  const now = new Date().getTime()
  const end = new Date(activity.end_time).getTime()
  const diff = end - now
  
  if (diff <= 0) return '即将结束'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `剩余 ${days} 天 ${hours} 小时`
  if (hours > 0) return `剩余 ${hours} 小时 ${minutes} 分钟`
  return `剩余 ${minutes} 分钟`
}

// 获取距开始时间（未开始）
function getStartCountdownText(activity) {
  const now = new Date().getTime()
  const start = new Date(activity.start_time).getTime()
  const diff = start - now
  
  if (diff <= 0) return '即将开始'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} 天后开始`
  if (hours > 0) return `${hours} 小时后开始`
  return '即将开始'
}

// 获取结束文本
function getEndText(activity) {
  const now = new Date().getTime()
  const end = new Date(activity.end_time).getTime()
  const diff = now - end
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 30) return '已结束'
  if (days > 0) return `已结束 ${days} 天`
  return '刚刚结束'
}

// 格式化日期（短格式）
function formatDateShort(datetime) {
  if (!datetime) return '-'
  const date = new Date(datetime)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 获取活动列表
async function loadActivityList() {
  try {
    loading.value = true
    const params = {
      title: searchForm.title,
      type: searchForm.type,
      status: searchForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    // 添加时间范围筛选
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_time = searchForm.dateRange[0]
      params.end_time = searchForm.dateRange[1]
    }
    
    const res = await getActivityList(params)
    
    // 为每个活动计算动态状态和商品数量
    activityList.value = (res.list || []).map(activity => ({
      ...activity,
      dynamicStatus: calculateDynamicStatus(activity),
      productCount: activity.productCount || 0
    }))
    
    pagination.total = res.pagination?.total || 0
    
    // 更新全局统计数据
    if (res.stats) {
      Object.assign(stats, res.stats)
    }
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
    status: '',
    dateRange: null
  })
  pagination.page = 1
  loadActivityList()
}

// 选择变化
function handleSelectionChange(selection) {
  selectedActivities.value = selection
}

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedActivities.value.length} 个活动吗？此操作不可恢复！`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 依次删除
    for (const activity of selectedActivities.value) {
      await deleteActivity(activity.id)
    }
    
    ElMessage.success('批量删除成功')
    selectedActivities.value = []
    loadActivityList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 新建活动
function handleAdd() {
  router.push('/marketing/activities/create')
}

// 编辑活动
function handleEdit(row) {
  router.push(`/marketing/activities/${row.id}/edit`)
}

// 复制活动
function handleCopy(row) {
  // 直接跳转到新建页面，携带复制参数
  router.push({
    path: '/marketing/activities/create',
    query: { copyFrom: row.id }
  })
}

// 更多操作
async function handleMoreAction(command, row) {
  if (command === 'copy') {
    await handleCopy(row)
  } else if (command === 'end') {
    await handleUpdateStatus(row, 0)
  } else if (command === 'delete') {
    await ElMessageBox.confirm(
      '确定删除该活动吗？此操作不可恢复！',
      '删除活动',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await handleDelete(row)
  }
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
    // 初始化 priceMode
    activityProducts.value = (res.list || []).map(product => ({
      ...product,
      priceMode: product.special_price ? 'special' : 'discount'
    }))
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
      status: 1, // 只获取已上架商品
      page: productPagination.page,
      pageSize: productPagination.pageSize
    }
    
    const res = await getProductList(params)
    availableProducts.value = res.list || []
    productPagination.total = res.total || 0
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

// 定价模式切换
function handlePriceModeChange(row, mode) {
  row.priceMode = mode
  if (mode === 'discount') {
    // 切换到折扣模式，清空特价
    row.special_price = null
  } else {
    // 切换到特价模式，清空折扣
    row.discount = null
  }
  handleUpdateProduct(row)
}

// 折扣变化处理
function handleDiscountChange(row) {
  row.priceMode = 'discount'
  row.special_price = null
  handleUpdateProduct(row)
}

// 特价变化处理
function handleSpecialPriceChange(row) {
  row.priceMode = 'special'
  row.discount = null
  handleUpdateProduct(row)
}

// 计算活动价格
function getActivityPrice(row) {
  // 优先使用特价
  if (row.priceMode === 'special' && row.special_price) {
    return row.special_price.toFixed(2)
  }
  // 其次使用折扣
  if (row.discount && row.product?.price) {
    return (row.product.price * row.discount / 10).toFixed(2)
  }
  // 兜底使用特价（向后兼容旧数据）
  if (row.special_price) {
    return row.special_price.toFixed(2)
  }
  return row.product?.price?.toFixed(2) || '0.00'
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

// 获取活动类型图标
function getActivityTypeIcon(type) {
  const map = {
    festival: '🎉',
    newbie: '👶',
    vip: '👑',
    group: '👥'
  }
  return map[type] || '📌'
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

// 格式化日期时间（保留原方法用于弹窗）
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
  
  // 检查是否需要打开商品管理对话框
  const openProductDialog = route.query.openProductDialog
  if (openProductDialog) {
    // 从 URL 中找到对应的活动并打开商品管理
    setTimeout(async () => {
      const activity = activityList.value.find(a => a.id == openProductDialog)
      if (activity) {
        await handleManageProducts(activity)
      }
      // 清除 query 参数
      router.replace({ query: {} })
    }, 500)
  }
})
</script>

<style scoped>
.activity-list {
  padding: 20px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.stat-card:nth-child(1) {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #909399 0%, #b1b3b8 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>