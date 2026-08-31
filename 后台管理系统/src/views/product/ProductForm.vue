<template>
  <div class="product-form">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑商品' : '添加商品' }}</span>
      </template>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="120px"
        style="max-width: 800px;"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="商品分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品图片" prop="image_url">
          <el-input v-model="form.image_url" placeholder="请输入图片URL" />
          <div style="margin-top: 10px;">
            <el-image 
              v-if="form.image_url" 
              :src="form.image_url" 
              style="width: 200px; height: 200px;"
              fit="cover"
            />
          </div>
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="form.price" :min="0.01" :step="0.01" :precision="2" />
        </el-form-item>

        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品描述"
          />
        </el-form-item>

        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            提交
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const categories = ref([])

const isEdit = Boolean(route.params.id)

const form = reactive({
  name: '',
  category_id: null,
  image_url: '',
  price: 0,
  stock: 0,
  description: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  image_url: [{ required: true, message: '请输入商品图片URL', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }]
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    categories.value = res.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchProduct = async () => {
  if (!isEdit) return
  
  try {
    const res = await request.get(`/admin/products/${route.params.id}`)
    Object.assign(form, res)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    if (isEdit) {
      await request.put(`/admin/products/${route.params.id}`, form)
      ElMessage.success('修改成功')
    } else {
      await request.post('/admin/products', form)
      ElMessage.success('添加成功')
    }
    
    router.push('/products')
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchProduct()
})
</script>