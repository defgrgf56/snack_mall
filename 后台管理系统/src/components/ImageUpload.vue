<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :before-upload="beforeUpload"
      :disabled="disabled || uploading"
      accept="image/*"
    >
      <!-- 已上传的图片 -->
      <div v-if="imageUrl && !uploading" class="image-preview">
        <el-image :src="imageUrl" fit="cover" class="uploaded-image" />
        <div class="image-info">
          <span v-if="imageSize" class="size-info">{{ imageSize }}</span>
        </div>
        <div class="image-mask">
          <el-icon class="icon-view" @click.stop="handlePreview"><View /></el-icon>
          <el-icon class="icon-delete" @click.stop="handleRemove"><Delete /></el-icon>
        </div>
      </div>
      
      <!-- 上传中状态 -->
      <div v-else-if="uploading" class="upload-progress">
        <el-progress 
          type="circle" 
          :percentage="uploadProgress" 
          :width="120"
          :stroke-width="6"
        />
        <div class="progress-text">上传中...</div>
      </div>
      
      <!-- 上传占位符 -->
      <div v-else class="upload-placeholder">
        <el-icon class="icon-plus"><Plus /></el-icon>
        <div class="tip">{{ tip }}</div>
        <div class="tip-size">支持 JPG/PNG/GIF/WEBP，最大 {{ maxSize }}MB</div>
      </div>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <div class="preview-content">
        <el-image :src="imageUrl" fit="contain" style="width: 100%" />
        <div v-if="imageMetadata" class="metadata">
          <div class="metadata-item">
            <span class="label">尺寸：</span>
            <span class="value">{{ imageMetadata.width }} × {{ imageMetadata.height }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">大小：</span>
            <span class="value">{{ imageMetadata.size }}</span>
          </div>
          <div v-if="imageMetadata.compressed" class="metadata-item compressed">
            <el-icon><Check /></el-icon>
            <span>已优化 {{ imageMetadata.compressionRatio }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
const uploading = ref(false)
const uploadProgress = ref(0)
const imageSize = ref('')
const imageMetadata = ref(null)

// 监听图片URL变化，加载图片元数据
watch(imageUrl, async (newUrl, oldUrl) => {
  // 避免重复加载相同URL
  if (newUrl && newUrl !== oldUrl && !newUrl.startsWith('blob:')) {
    await loadImageMetadata(newUrl)
  } else if (!newUrl) {
    imageSize.value = ''
    imageMetadata.value = null
  }
})

// 加载图片元数据
const loadImageMetadata = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      imageSize.value = `${img.width} × ${img.height}`
      resolve()
    }
    img.onerror = () => {
      imageSize.value = ''
      resolve()
    }
    img.src = url
  })
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  uploading.value = true
  uploadProgress.value = 0
  return true
}

const handleProgress = (event) => {
  uploadProgress.value = Math.round(event.percent)
}

const handleSuccess = (response) => {
  uploading.value = false
  uploadProgress.value = 0
  
  if (response.code === 200) {
    // 构建完整的图片URL
    const fullUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '') + response.data.url
    
    // 先保存元数据（不含尺寸）
    const metadata = {
      width: 0,
      height: 0,
      size: formatFileSize(response.data.size),
      originalSize: formatFileSize(response.data.originalSize),
      compressed: response.data.compressed,
      compressionRatio: response.data.compressionRatio
    }
    
    // 加载图片尺寸（异步，避免触发递归更新）
    const img = new Image()
    img.onload = () => {
      // 一次性更新所有数据，避免多次触发响应式更新
      metadata.width = img.width
      metadata.height = img.height
      imageMetadata.value = metadata
      imageSize.value = `${img.width} × ${img.height}`
    }
    img.onerror = () => {
      // 加载失败也要设置元数据
      imageMetadata.value = metadata
    }
    img.src = fullUrl
    
    // 最后更新 URL，触发 watch
    imageUrl.value = fullUrl
    
    // 显示压缩信息
    if (response.data.compressed) {
      ElMessage.success({
        message: `上传成功！已优化 ${response.data.compressionRatio}`,
        duration: 3000
      })
    } else {
      ElMessage.success('上传成功')
    }
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = () => {
  uploading.value = false
  uploadProgress.value = 0
  ElMessage.error('上传失败，请重试')
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleRemove = () => {
  imageUrl.value = ''
  imageSize.value = ''
  imageMetadata.value = null
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

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  text-align: center;
}

.size-info {
  font-size: 11px;
  color: #fff;
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
  transition: color 0.3s;
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
  margin-bottom: 4px;
}

.tip-size {
  font-size: 10px;
  color: #c0c4cc;
  text-align: center;
  padding: 0 8px;
}

.upload-progress {
  width: 148px;
  height: 148px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.progress-text {
  margin-top: 10px;
  font-size: 12px;
  color: #606266;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.metadata-item .label {
  color: #909399;
}

.metadata-item .value {
  color: #303133;
  font-weight: 500;
}

.metadata-item.compressed {
  color: #67c23a;
  font-weight: 500;
}

.metadata-item.compressed .el-icon {
  font-size: 16px;
}
</style>
