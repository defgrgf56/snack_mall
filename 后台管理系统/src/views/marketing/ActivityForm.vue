<template>
  <div class="activity-form">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>{{ isEdit ? '编辑活动' : isCopy ? '复制活动' : '新建活动' }}</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入活动标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="副标题" prop="subtitle">
          <el-input
            v-model="formData.subtitle"
            placeholder="请输入副标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动封面" prop="cover">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="formData.cover" :src="formData.cover" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议尺寸：750x400px，支持jpg/png格式</div>
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="festival">节日促销</el-radio>
            <el-radio label="newbie">新人专享</el-radio>
            <el-radio label="vip">会员专区</el-radio>
            <el-radio label="group">拼团活动</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="活动时间" required>
          <el-col :span="11">
            <el-form-item prop="start_time">
              <el-date-picker
                v-model="formData.start_time"
                type="datetime"
                placeholder="开始时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="updateStatusPreview"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" style="text-align: center;">至</el-col>
          <el-col :span="11">
            <el-form-item prop="end_time">
              <el-date-picker
                v-model="formData.end_time"
                type="datetime"
                placeholder="结束时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="updateStatusPreview"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="活动状态">
          <el-tag :type="statusPreview.type" size="large">
            {{ statusPreview.text }}
          </el-tag>
          <div class="form-tip">状态由活动时间自动计算</div>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="9999"
          />
          <div class="form-tip">数字越大越靠前</div>
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="5"
            placeholder="请输入活动描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="活动商品">
          <el-button type="primary" plain @click="handleManageProducts">
            <el-icon><Goods /></el-icon>
            管理活动商品
          </el-button>
          <div class="form-tip">快速跳转到商品管理页面</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建活动' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Goods } from '@element-plus/icons-vue'
import { getActivityDetail, createActivity, updateActivity } from '@/api/activity'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const isCopy = ref(false)
const activityId = ref(null)
const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  subtitle: '',
  cover: '',
  type: 'festival',
  start_time: '',
  end_time: '',
  sort: 0,
  description: ''
})

// 状态预览
const statusPreview = reactive({
  text: '未开始',
  type: 'warning'
})

// 计算活动状态
function calculateStatus(startTime, endTime) {
  if (!startTime || !endTime) {
    return { text: '未开始', type: 'warning' }
  }
  
  const now = new Date().getTime()
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  
  if (now < start) {
    return { text: '未开始', type: 'warning' }
  }
  if (now > end) {
    return { text: '已结束', type: 'info' }
  }
  return { text: '进行中', type: 'success' }
}

// 更新状态预览
function updateStatusPreview() {
  const status = calculateStatus(formData.start_time, formData.end_time)
  statusPreview.text = status.text
  statusPreview.type = status.type
}

// 上传地址
const uploadUrl = ref(import.meta.env.VITE_API_BASE_URL + '/upload')

// 上传请求头（带 token）
const uploadHeaders = ref({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' }
  ],
  subtitle: [
    { required: true, message: '请输入副标题', trigger: 'blur' }
  ],
  cover: [
    { required: true, message: '请上传活动封面', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 加载活动详情
async function loadActivityDetail() {
  try {
    const res = await getActivityDetail(activityId.value)
    Object.assign(formData, res)
    // 加载后更新状态预览
    updateStatusPreview()
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error(error.message || '获取活动详情失败')
    handleBack()
  }
}

// 封面上传成功
function handleCoverSuccess(response) {
  console.log('上传响应:', response)
  if (response.code === 200 && response.data?.url) {
    // 拼接完整的图片 URL（后端地址 + 相对路径）
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    formData.cover = baseUrl + response.data.url
    ElMessage.success('上传成功')
  } else if (response.code === 401) {
    ElMessage.error('登录已过期，请重新登录')
    router.push('/login')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 封面上传前检查
function beforeCoverUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate()
    
    // 验证时间范围
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      ElMessage.error('结束时间必须大于开始时间')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      await updateActivity(activityId.value, formData)
      ElMessage.success('修改成功')
    } else {
      await createActivity(formData)
      ElMessage.success('创建成功')
    }
    
    handleBack()
  } catch (error) {
    if (error?.errors) {
      // 表单验证失败
      return
    }
    console.error('提交失败:', error)
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 返回列表
function handleBack() {
  router.push('/marketing/activities')
}

// 管理商品
function handleManageProducts() {
  // 保存当前编辑状态到 sessionStorage
  sessionStorage.setItem('activityFormData', JSON.stringify(formData))
  // 跳转回列表页，触发商品管理对话框
  router.push({
    path: '/marketing/activities',
    query: { 
      openProductDialog: activityId.value 
    }
  })
}

// 初始化
onMounted(async () => {
  const id = route.params.id
  const copyFrom = route.query.copyFrom
  
  if (copyFrom) {
    // 复制模式
    isCopy.value = true
    try {
      const res = await getActivityDetail(copyFrom)
      // 设置未来时间（明天开始，30天后结束）
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const endDate = new Date(tomorrow)
      endDate.setDate(endDate.getDate() + 30)
      
      // 填充表单数据
      Object.assign(formData, {
        title: res.title + '（副本）',
        subtitle: res.subtitle,
        cover: res.cover,
        type: res.type,
        description: res.description,
        sort: res.sort,
        start_time: tomorrow.toISOString().slice(0, 19).replace('T', ' '),
        end_time: endDate.toISOString().slice(0, 19).replace('T', ' ')
      })
      updateStatusPreview()
      ElMessage.success('已加载活动配置，请调整时间后保存')
    } catch (error) {
      console.error('加载活动详情失败:', error)
      ElMessage.error('加载活动配置失败')
    }
  } else if (id && id !== 'create') {
    // 编辑模式
    isEdit.value = true
    activityId.value = id
    loadActivityDetail()
  } else {
    // 新建模式，设置默认状态预览
    updateStatusPreview()
  }
})
</script>

<style scoped>
.activity-form {
  padding: 20px;
}

.cover-uploader {
  display: inline-block;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>