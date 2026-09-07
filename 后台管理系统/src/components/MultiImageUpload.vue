<template>
  <div class="multi-image-upload">
    <draggable
      v-model="imageList"
      item-key="uid"
      class="image-list"
      :animation="200"
      @end="handleDragEnd"
    >
      <template #item="{ element, index }">
        <div class="image-item">
          <el-image :src="element.url" fit="cover" class="image" />
          <div class="image-mask">
            <el-icon class="icon" @click="handlePreview(element)"><View /></el-icon>
            <el-icon class="icon" @click="handleRemove(index)"><Delete /></el-icon>
          </div>
          <div class="image-index">{{ index + 1 }}</div>
        </div>
      </template>
    </draggable>

    <el-upload
      v-if="imageList.length < limit"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :disabled="disabled"
      accept="image/*"
      class="upload-trigger"
    >
      <div class="upload-placeholder">
        <el-icon class="icon-plus"><Plus /></el-icon>
        <div class="tip">上传图片</div>
        <div class="limit-tip">{{ imageList.length }}/{{ limit }}</div>
      </div>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <el-image :src="previewUrl" fit="contain" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 9
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

const imageList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const isUpdatingFromProps = ref(false) // 标记是否正在从 props 更新

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (Array.isArray(newVal)) {
    // 检查是否真的发生了变化
    const newUrls = newVal.join(',')
    const currentUrls = imageList.value.map(item => item.url).join(',')
    
    if (newUrls !== currentUrls) {
      isUpdatingFromProps.value = true
      imageList.value = newVal.map((url, index) => ({
        uid: Date.now() + index,
        url
      }))
      // 使用 nextTick 确保响应式更新完成后再重置标记
      setTimeout(() => {
        isUpdatingFromProps.value = false
      }, 0)
    }
  }
}, { immediate: true })

// 监听 imageList 变化
watch(imageList, (newVal) => {
  // 如果正在从 props 更新，跳过 emit，避免循环
  if (!isUpdatingFromProps.value) {
    const urls = newVal.map(item => item.url)
    emit('update:modelValue', urls)
  }
}, { deep: true })

const beforeUpload = (file) => {
  if (imageList.value.length >= props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
    return false
  }

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
    const fullUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '') + response.data.url
    imageList.value.push({
      uid: Date.now(),
      url: fullUrl
    })
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}

const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

const handleRemove = (index) => {
  imageList.value.splice(index, 1)
  ElMessage.success('已移除图片')
}

const handleDragEnd = () => {
  ElMessage.success('排序成功')
}
</script>

<style scoped>
.multi-image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  position: relative;
  width: 148px;
  height: 148px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  cursor: move;
}

.image {
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

.image-item:hover .image-mask {
  opacity: 1;
}

.icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
}

.icon:hover {
  color: #409eff;
}

.image-index {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.upload-trigger {
  display: inline-block;
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

.limit-tip {
  font-size: 11px;
  color: #b4b7bd;
}
</style>