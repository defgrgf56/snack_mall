<template>
  <div class="category-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分类</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <el-table :data="categories" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.icon"
              :src="row.icon" 
              style="width: 50px; height: 50px; border-radius: 4px;"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标URL" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  icon: '',
  sort: 0,
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/categories')
    categories.value = res.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 添加分类
const handleAdd = () => {
  dialogTitle.value = '添加分类'
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  dialogTitle.value = '编辑分类'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // 更新
          await request.put(`/admin/categories/${formData.value.id}`, formData.value)
          ElMessage.success('更新成功')
        } else {
          // 创建
          await request.post('/admin/categories', formData.value)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该分类吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/admin/categories/${row.id}`)
      ElMessage.success('删除成功')
      fetchCategories()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    icon: '',
    sort: 0,
    status: 1
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}
</style>