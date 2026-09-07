<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :disabled="disabled"
      accept="image/*"
    >
      <div v-if="imageUrl" class="image-preview">
        <el-image :src="imageUrl" fit="cover" class="uploaded-image" />
        <div class="image-mask">
          <el-icon class="icon-view" @click.stop="handlePreview"><View /></el-icon>
          <el-icon class="icon-delete" @click.stop="handleRemove"><Delete /></el-icon>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon class="icon-plus"><Plus /></el-icon>
        <div class="tip">{{ tip }}</div>
      </div>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <el-image :src="imageUrl" fit="contain" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  tip: {
    type: String,
    default: '点击上传图片'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxSize: {
    type: Number,
    default: 5 // MB
  }
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/upload'
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token')
  return {
    Authorization: `Bearer ${token}`
  }
})

const imageUrl = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const previewVisible = ref(false)

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.code === 200) {
    // 构建完整的图片URL
    const fullUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '') + response.data.url
    imageUrl.value = fullUrl
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleRemove = () => {
  imageUrl.value = ''
  ElMessage.success('已移除图片')
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
}

.image-preview {
  position: relative;
  width: 148px;
  height: 148px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-mask {
  opacity: 1;
}

.icon-view,
.icon-delete {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
}

.icon-view:hover {
  color: #409eff;
}

.icon-delete:hover {
  color: #f56c6c;
}

.upload-placeholder {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.icon-plus {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.tip {
  font-size: 12px;
  color: #8c939d;
}
</style>
