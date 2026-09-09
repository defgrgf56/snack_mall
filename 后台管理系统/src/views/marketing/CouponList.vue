<template>
  <div class="coupon-list">
    <el-card>
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px;">
        <el-icon><Plus /></el-icon> 添加优惠券
      </el-button>

      <!-- 优惠券列表 -->
      <el-table :data="coupons" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="优惠券名称" min-width="200" />
        <el-table-column prop="discount_type" label="类型" width="100">
          <template #default="{ row }">
            {{ row.discount_type === 2 ? '折扣券' : '满减券' }}
          </template>
        </el-table-column>
        <el-table-column prop="discount_value" label="优惠" width="120">
          <template #default="{ row }">
            {{ row.discount_type === 2 ? row.discount_value + '折' : '减¥' + row.discount_value }}
          </template>
        </el-table-column>
        <el-table-column prop="min_amount" label="使用门槛" width="120">
          <template #default="{ row }">
            {{ row.min_amount > 0 ? '满¥' + row.min_amount : '无门槛' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_count" label="发放数量" width="100" />
        <el-table-column prop="receive_count" label="已领取" width="100" />
        <el-table-column prop="used_count" label="已使用" width="100" />
        <el-table-column prop="per_limit" label="每人限领" width="100">
          <template #default="{ row }">
            {{ row.per_limit }}张
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <div>{{ row.start_time }}</div>
            <div>至 {{ row.end_time }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchCoupons"
        @current-change="fetchCoupons"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑优惠券' : '添加优惠券'" 
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="优惠类型" prop="discount_type">
          <el-radio-group v-model="form.discount_type">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠力度" prop="discount_value">
          <el-input-number 
            v-model="form.discount_value" 
            :min="form.discount_type === 2 ? 0.1 : 1" 
            :max="form.discount_type === 2 ? 9.9 : 999"
            :step="form.discount_type === 2 ? 0.1 : 1"
            :precision="form.discount_type === 2 ? 1 : 0"
          />
          <span style="margin-left: 10px;">
            {{ form.discount_type === 2 ? '折' : '元' }}
          </span>
        </el-form-item>
        <el-form-item label="使用门槛" prop="min_amount">
          <el-input-number v-model="form.min_amount" :min="0" :step="10" />
          <span style="margin-left: 10px;">元（0表示无门槛）</span>
        </el-form-item>
        <el-form-item label="发放数量" prop="total_count">
          <el-input-number v-model="form.total_count" :min="1" />
        </el-form-item>
        <el-form-item label="每人限领" prop="per_limit">
          <el-input-number v-model="form.per_limit" :min="1" />
          <span style="margin-left: 10px;">张</span>
        </el-form-item>
        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const coupons = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  name: '',
  type: 1,
  discount_type: 1,
  discount_value: 10,
  min_amount: 0,
  total_count: 100,
  per_limit: 1,
  dateRange: [],
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  discount_type: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
  discount_value: [{ required: true, message: '请输入优惠力度', trigger: 'blur' }],
  total_count: [{ required: true, message: '请输入发放数量', trigger: 'blur' }],
  per_limit: [{ required: true, message: '请输入每人限领数量', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择有效期', trigger: 'change' }]
}

const fetchCoupons = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/coupons', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })
    coupons.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    ElMessage.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    name: '',
    type: 1,
    discount_type: 1,
    discount_value: 10,
    min_amount: 0,
    total_count: 100,
    per_limit: 1,
    dateRange: [],
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  // 将数据库字段转换为表单字段
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    discount_type: row.discount_type,
    discount_value: row.discount_value,
    min_amount: row.min_amount,
    total_count: row.total_count,
    per_limit: row.per_limit,
    dateRange: [row.start_time, row.end_time],
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 构建提交数据
    const submitData = {
      name: form.name,
      type: form.type,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_amount: form.min_amount,
      total_count: form.total_count,
      per_limit: form.per_limit,
      start_time: form.dateRange[0],
      end_time: form.dateRange[1],
      status: form.status
    }
    
    if (isEdit.value) {
      await request.put(`/admin/coupons/${form.id}`, submitData)
      ElMessage.success('修改成功')
    } else {
      await request.post('/admin/coupons', submitData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchCoupons()
  } catch (error) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败: ' + (error.message || '未知错误'))
    }
  }
}

const handleToggleStatus = async (row) => {
  try {
    await request.put(`/admin/coupons/${row.id}/status`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success('操作成功')
    fetchCoupons()
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该优惠券吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/admin/coupons/${id}`)
    ElMessage.success('删除成功')
    fetchCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>