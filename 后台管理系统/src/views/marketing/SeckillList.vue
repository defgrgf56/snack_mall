<template>
  <div class="seckill-list">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="未开始" :value="2" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索秒杀标题" 
            clearable 
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreate">新建秒杀</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.product?.cover"
              :src="row.product.cover" 
              style="width: 60px; height: 60px; border-radius: 4px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" min-width="200" />
        <el-table-column label="商品" prop="product.name" min-width="150" />
        <el-table-column label="原价" width="100">
          <template #default="{ row }">
            <span>¥{{ row.original_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="秒杀价" width="100">
          <template #default="{ row }">
            <span class="seckill-price">¥{{ row.seckill_price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存/已售" width="120">
          <template #default="{ row }">
            <div>库存: {{ row.stock }}</div>
            <div>已售: {{ row.sold }}</div>
          </template>
        </el-table-column>
        <el-table-column label="限购" width="80">
          <template #default="{ row }">
            {{ row.limit_per_user }}件
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            <div>开始: {{ formatDate(row.start_time) }}</div>
            <div>结束: {{ formatDate(row.end_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              link 
              :type="row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSeckillList, deleteSeckill, updateSeckillStatus } from '@/api/seckill'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const filterForm = reactive({
  status: null,
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    
    const res = await getSeckillList(params)
    tableData.value = res.list
    pagination.total = res.pagination.total
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  filterForm.status = null
  filterForm.keyword = ''
  pagination.page = 1
  fetchList()
}

// 新建
const handleCreate = () => {
  router.push('/marketing/seckills/create')
}

// 编辑
const handleEdit = (row) => {
  router.push(`/marketing/seckills/${row.id}/edit`)
}

// 切换状态
const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '停用'
  
  try {
    await ElMessageBox.confirm(
      `确认${statusText}该秒杀活动吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateSeckillStatus(row.id, newStatus)
    ElMessage.success(`${statusText}成功`)
    fetchList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败`)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该秒杀活动吗？删除后不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteSeckill(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: '已结束',
    1: '进行中',
    2: '未开始'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.seckill-list {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.seckill-price {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 14px;
}
</style>