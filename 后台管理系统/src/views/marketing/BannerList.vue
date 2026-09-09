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
              :src="row.image" 
              fit="cover" 
              style="width: 150px; height: 80px; border-radius: 4px;"
              :preview-src-list="[row.image]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="link_type" label="链接类型" width="120">
          <template #default="{ row }">
            {{ getLinkTypeText(row.link_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="link_value" label="链接值" width="150">
          <template #default="{ row }">
            <span v-if="row.link_type === 1 && products[row.link_value]">
              {{ products[row.link_value] }}
            </span>
            <span v-else-if="row.link_type === 2 && categories[row.link_value]">
              {{ categories[row.link_value] }}
            </span>
            <span v-else>{{ row.link_value || '-' }}</span>
          </template>
        </el-table-column>
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
        <el-form-item label="轮播图片" prop="image">
          <ImageUpload v-model="form.image" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="链接类型" prop="link_type">
          <el-select v-model="form.link_type" placeholder="请选择链接类型" @change="handleLinkTypeChange">
            <el-option label="无链接" :value="0" />
            <el-option label="商品详情" :value="1" />
            <el-option label="商品分类" :value="2" />
            <el-option label="外部链接" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联商品" prop="link_value" v-if="form.link_type === 1">
          <el-select 
            v-model="form.link_value" 
            placeholder="请选择商品" 
            filterable 
            remote
            :remote-method="searchProducts"
            :loading="productLoading"
            style="width: 100%;"
          >
            <el-option 
              v-for="product in productList" 
              :key="product.id" 
              :label="`[${product.id}] ${product.name}`" 
              :value="product.id.toString()" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联分类" prop="link_value" v-if="form.link_type === 2">
          <el-select v-model="form.link_value" placeholder="请选择分类" style="width: 100%;">
            <el-option 
              v-for="cat in categoryList" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id.toString()" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="外部链接" prop="link_value" v-if="form.link_type === 3">
          <el-input 
            v-model="form.link_value" 
            placeholder="请输入完整的URL，如：https://example.com" 
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
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import ImageUpload from '@/components/ImageUpload.vue'

const loading = ref(false)
const submitting = ref(false)
const productLoading = ref(false)
const banners = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 商品和分类数据
const productList = ref([])
const categoryList = ref([])
const products = ref({}) // ID映射到名称
const categories = ref({}) // ID映射到名称

const form = reactive({
  image: '',
  title: '',
  link_type: 0,
  link_value: '',
  sort: 0,
  status: 1
})

const rules = {
  image: [{ required: true, message: '请上传轮播图片', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  link_type: [{ required: true, message: '请选择链接类型', trigger: 'change' }],
  link_value: [
    { 
      validator: (rule, value, callback) => {
        if (form.link_type === 0) {
          callback()
        } else if (form.link_type === 3) {
          // 验证 URL 格式
          if (!value) {
            callback(new Error('请输入外部链接'))
          } else if (!/^https?:\/\/.+/.test(value)) {
            callback(new Error('请输入有效的URL，以 http:// 或 https:// 开头'))
          } else {
            callback()
          }
        } else {
          if (!value) {
            callback(new Error('请选择关联内容'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ]
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

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    categoryList.value = res.list || []
    // 构建 ID 到名称的映射
    categories.value = {}
    categoryList.value.forEach(cat => {
      categories.value[cat.id] = cat.name
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 搜索商品（远程搜索）
const searchProducts = async (query) => {
  if (!query) {
    productList.value = []
    return
  }
  
  productLoading.value = true
  try {
    const res = await request.get('/admin/products', {
      params: {
        name: query,
        page: 1,
        pageSize: 20
      }
    })
    productList.value = res.list || []
    // 构建 ID 到名称的映射
    productList.value.forEach(p => {
      products.value[p.id] = p.name
    })
  } catch (error) {
    console.error('搜索商品失败:', error)
  } finally {
    productLoading.value = false
  }
}

// 加载已选商品信息
const loadProduct = async (productId) => {
  if (!productId || products.value[productId]) return
  
  try {
    const res = await request.get(`/admin/products/${productId}`)
    products.value[productId] = res.name
    productList.value = [res]
  } catch (error) {
    console.error('获取商品信息失败:', error)
  }
}

const getLinkTypeText = (type) => {
  const map = {
    0: '无链接',
    1: '商品详情',
    2: '商品分类',
    3: '外部链接'
  }
  return map[type] || '未知'
}

const handleLinkTypeChange = () => {
  // 切换链接类型时清空链接值
  form.link_value = ''
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    image: '',
    title: '',
    link_type: 0,
    link_value: '',
    sort: 0,
    status: 1
  })
  productList.value = []
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    image: row.image,
    title: row.title,
    link_type: row.link_type,
    link_value: row.link_value || '',
    sort: row.sort,
    status: row.status
  })
  
  // 如果链接类型是商品，加载商品信息
  if (row.link_type === 1 && row.link_value) {
    await loadProduct(parseInt(row.link_value))
  }
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const submitData = {
      title: form.title,
      image: form.image,
      link_type: form.link_type,
      link_value: form.link_type === 0 ? '' : form.link_value,
      sort: form.sort,
      status: form.status
    }
    
    if (isEdit.value) {
      await request.put(`/admin/banners/${form.id}`, submitData)
      ElMessage.success('修改成功')
    } else {
      await request.post('/admin/banners', submitData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchBanners()
  } catch (error) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
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
  fetchCategories()
})
</script>