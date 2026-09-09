<template>
  <div class="seckill-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑秒杀' : '新建秒杀' }}</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="秒杀标题" prop="title">
          <el-input 
            v-model="formData.title" 
            placeholder="请输入秒杀标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="选择商品" prop="product_id">
          <ProductSelector
            v-model="formData.product_id"
            :product="selectedProduct"
            @change="handleProductChange"
          />
        </el-form-item>

        <el-form-item label="商品原价">
          <el-input
            :model-value="formData.original_price > 0 ? `¥${formData.original_price}` : '请先选择商品'"
            disabled
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999; font-size: 12px">
            自动获取商品当前价格
          </span>
        </el-form-item>

        <el-form-item label="秒杀价" prop="seckill_price">
          <el-input-number
            v-model="formData.seckill_price"
            :min="0"
            :precision="2"
            :step="0.01"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999">元</span>
          <span v-if="discount > 0" style="margin-left: 10px; color: #ff4d4f">
            {{ discount }}折
          </span>
        </el-form-item>

        <el-form-item label="秒杀库存" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :min="1"
            :max="selectedProduct?.stock || 999999"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999">件</span>
          <span v-if="selectedProduct" style="margin-left: 10px; color: #999">
            商品库存: {{ selectedProduct.stock }}
          </span>
        </el-form-item>

        <el-form-item label="限购数量" prop="limit_per_user">
          <el-input-number
            v-model="formData.limit_per_user"
            :min="1"
            :max="formData.stock"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999">件/人</span>
        </el-form-item>

        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
            v-model="formData.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="formData.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999">数值越大越靠前</span>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="2">未开始</el-radio>
            <el-radio :label="1">进行中</el-radio>
            <el-radio :label="0">已结束</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSeckillDetail, createSeckill, updateSeckill } from '@/api/seckill'
import ProductSelector from '@/components/ProductSelector.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const submitting = ref(false)
const selectedProduct = ref(null)

const formData = reactive({
  title: '',
  product_id: null,
  original_price: 0,
  seckill_price: 0,
  stock: 1,
  limit_per_user: 1,
  start_time: '',
  end_time: '',
  sort: 0,
  status: 2
})

const rules = {
  title: [
    { required: true, message: '请输入秒杀标题', trigger: 'blur' }
  ],
  product_id: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  seckill_price: [
    { required: true, message: '请输入秒杀价', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('秒杀价必须大于0'))
        } else if (value >= formData.original_price) {
          callback(new Error('秒杀价必须低于原价'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  stock: [
    { required: true, message: '请输入秒杀库存', trigger: 'blur' }
  ],
  limit_per_user: [
    { required: true, message: '请输入限购数量', trigger: 'blur' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && formData.start_time && new Date(value) <= new Date(formData.start_time)) {
          callback(new Error('结束时间必须晚于开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 计算折扣
const discount = computed(() => {
  if (formData.original_price > 0 && formData.seckill_price > 0) {
    return ((formData.seckill_price / formData.original_price) * 10).toFixed(1)
  }
  return 0
})

// 商品变化
const handleProductChange = (product) => {
  if (product) {
    selectedProduct.value = product
    formData.original_price = parseFloat(product.price)
    
    // 自动生成标题
    if (!formData.title || formData.title === selectedProduct.value?.name) {
      formData.title = product.name
    }
  }
}

// 获取详情
const fetchDetail = async () => {
  try {
    const res = await getSeckillDetail(route.params.id)
    const data = res
    Object.assign(formData, {
      title: data.title,
      product_id: data.product_id,
      original_price: parseFloat(data.original_price),
      seckill_price: parseFloat(data.seckill_price),
      stock: data.stock,
      limit_per_user: data.limit_per_user,
      start_time: data.start_time,
      end_time: data.end_time,
      sort: data.sort,
      status: data.status
    })
    
    // 设置选中的商品
    if (data.product) {
      selectedProduct.value = data.product
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    handleBack()
  }
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const apiFunc = isEdit.value ? updateSeckill : createSeckill
    const params = isEdit.value ? [route.params.id, formData] : [formData]
    
    await apiFunc(...params)
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    handleBack()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 返回
const handleBack = () => {
  router.push('/marketing/seckills')
}

onMounted(async () => {
  if (isEdit.value) {
    await fetchDetail()
  }
})
</script>

<style scoped>
.seckill-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>