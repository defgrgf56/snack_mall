<template>
  <div class="banner-list">
    <el-card>
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px;">
        <el-icon><Plus /></el-icon> 添加轮播图
      </el-button>

      <!-- 轮播图列表 -->
      <el-table :data="banners" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image 
              :src="row.image_url" 
              fit="cover" 
              style="width: 150px; height: 80px; border-radius: 4px;"
              :preview-src-list="[row.image_url]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="link_type" label="链接类型" width="120">
          <template #default="{ row }">
            {{ getLinkTypeText(row.link_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="link_value" label="链接值" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '显示' : '隐藏' }}
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
              {{ row.status === 1 ? '隐藏' : '显示' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑轮播图' : '添加轮播图'" 
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="图片URL" prop="image_url">
          <el-input v-model="form.image_url" placeholder="请输入图片URL" />
          <div style="margin-top: 10px;">
            <el-image 
              v-if="form.image_url" 
              :src="form.image_url" 
              style="width: 100%; max-height: 200px;"
              fit="contain"
            />
          </div>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="链接类型" prop="link_type">
          <el-select v-model="form.link_type" placeholder="请选择链接类型">
            <el-option label="无" value="none" />
            <el-option label="商品" value="product" />
            <el-option label="分类" value="category" />
            <el-option label="活动" value="activity" />
            <el-option label="外部链接" value="url" />
          </el-select>
        </el-form-item>
        <el-form-item label="链接值" prop="link_value" v-if="form.link_type !== 'none'">
          <el-input 
            v-model="form.link_value" 
            :placeholder="getLinkPlaceholder(form.link_type)" 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
          <span style="margin-left: 10px; color: #999;">数值越小越靠前</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
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
const banners = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  image_url: '',
  title: '',
  link_type: 'none',
  link_value: '',
  sort: 0,
  status: 1
})

const rules = {
  image_url: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  link_type: [{ required: true, message: '请选择链接类型', trigger: 'change' }]
}

const fetchBanners = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/banners')
    banners.value = res.list || []
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

const getLinkTypeText = (type) => {
  const map = {
    none: '无',
    product: '商品',
    category: '分类',
    activity: '活动',
    url: '外部链接'
  }
  return map[type] || type
}

const getLinkPlaceholder = (type) => {
  const map = {
    product: '请输入商品ID',
    category: '请输入分类ID',
    activity: '请输入活动ID',
    url: '请输入完整URL'
  }
  return map[type] || ''
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    image_url: '',
    title: '',
    link_type: 'none',
    link_value: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await request.put(`/admin/banners/${form.id}`, form)
      ElMessage.success('修改成功')
    } else {
      await request.post('/admin/banners', form)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchBanners()
  } catch (error) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleToggleStatus = async (row) => {
  try {
    await request.put(`/admin/banners/${row.id}/status`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success('操作成功')
    fetchBanners()
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/admin/banners/${id}`)
    ElMessage.success('删除成功')
    fetchBanners()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchBanners()
})
</script>