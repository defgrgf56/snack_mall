<template>
  <el-popover placement="bottom-end" :width="380" trigger="click" v-model:visible="popoverVisible" @show="onShow" @hide="onHide">
    <template #reference>
      <div class="notification-bell" :class="{ 'has-unread': store.unreadCount > 0 }">
        <el-badge :value="store.unreadCount" :hidden="store.unreadCount === 0" :max="99">
          <el-icon :size="16" class="bell-icon"><Bell /></el-icon>
        </el-badge>
      </div>
    </template>

    <!-- 面板头部 -->
    <div class="notif-header">
      <span class="notif-title">通知</span>
      <div class="notif-header-actions">
        <el-tag v-if="store.wsConnected" size="small" type="success" effect="plain" class="ws-tag">实时</el-tag>
        <el-tag v-else size="small" type="info" effect="plain" class="ws-tag">离线</el-tag>
        <el-button text size="small" @click="handleMarkAllRead" :disabled="store.unreadCount === 0">
          全部已读
        </el-button>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notif-list" ref="listRef">
      <div v-if="loading && historyList.length === 0" class="notif-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="mergedList.length === 0" class="notif-empty">
        <el-empty description="暂无通知" :image-size="60" />
      </div>

      <div v-else class="notif-items">
        <div
          v-for="item in mergedList"
          :key="item.id"
          class="notif-item"
          :class="{ 'is-unread': !item.is_read }"
          @click="handleClick(item)"
        >
          <div class="notif-item-icon">
            <el-icon v-if="item.type === 'order'" :size="18" color="#409eff"><ShoppingCart /></el-icon>
            <el-icon v-else-if="item.type === 'favorite'" :size="18" color="#e6a23c"><Star /></el-icon>
            <el-icon v-else-if="item.type === 'review'" :size="18" color="#67c23a"><ChatDotRound /></el-icon>
            <el-icon v-else :size="18" color="#909399"><Bell /></el-icon>
          </div>
          <div class="notif-item-body">
            <div class="notif-item-title">{{ item.title }}</div>
            <div class="notif-item-content">{{ item.content }}</div>
            <div class="notif-item-time">{{ formatTime(item.created_at) }}</div>
          </div>
          <div v-if="!item.is_read" class="notif-item-dot"></div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="notif-footer">
      <el-button text size="small" @click="loadMore" :loading="loading" v-if="hasMore">
        加载更多
      </el-button>
      <span v-else-if="historyList.length > 0" class="notif-footer-text">已加载全部</span>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Star, ShoppingCart, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { getNotifications, markAsRead, markAllRead } from '@/api/notification'
import { ElMessage } from 'element-plus'

const store = useNotificationStore()
const router = useRouter()

const popoverVisible = ref(false)

const loading = ref(false)
const historyList = ref([]) // 从后端拉取的历史列表
const page = ref(1)
const pageSize = 20
const total = ref(0)
const listRef = ref(null)

const hasMore = computed(() => historyList.value.length < total.value)

// 合并实时推送 + 历史列表，去重，实时的排前面
const mergedList = computed(() => {
  const realtime = store.notifications.filter(
    rt => !historyList.value.some(h => h.id === rt.id)
  )
  return [...realtime, ...historyList.value]
})

async function fetchHistory(append = false) {
  loading.value = true
  try {
    const data = await getNotifications({ page: page.value, pageSize })
    total.value = data.total || 0
    if (append) {
      historyList.value = [...historyList.value, ...data.list]
    } else {
      historyList.value = data.list || []
    }
  } catch (e) {
    // 静默
  } finally {
    loading.value = false
  }
}

function onShow() {
  fetchHistory(false)
  page.value = 1
}

function onHide() {
  // 可选：关闭时不做特殊处理
}

function loadMore() {
  page.value++
  fetchHistory(true)
}

async function handleMarkAllRead() {
  try {
    await markAllRead()
    store.clearUnread()
    // 更新本地列表的已读状态
    historyList.value.forEach(item => { item.is_read = 1 })
    store.notifications.forEach(item => { item.is_read = 1 })
    ElMessage.success('已全部标记为已读')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 通知类型 → 跳转路由映射
const NAV_MAP = {
  order:    (id) => id ? `/orders/${id}` : '/orders',
  favorite: ()   => '/favorites',
  review:   ()   => '/reviews',
  system:   null
}

async function handleClick(item) {
  if (!item.is_read) {
    try {
      await markAsRead(item.id)
      item.is_read = 1
      store.decrementUnread()
    } catch (e) {
      // 静默
    }
  }
  // 关闭弹窗
  popoverVisible.value = false
  // 跳转到对应页面
  const nav = NAV_MAP[item.type]
  if (nav) {
    const target = nav(item.related_id)
    if (target) router.push(target)
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped lang="scss">
.notification-bell {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 6px;
  height: 32px;
  margin-right: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  .bell-icon {
    color: #606266;
  }
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;

  .notif-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .notif-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ws-tag {
    font-size: 11px;
  }
}

.notif-list {
  max-height: 400px;
  overflow-y: auto;
  margin: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
  }
}

.notif-loading, .notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
  gap: 8px;
}

.notif-items {
  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 4px;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: background-color 0.15s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.is-unread {
      background-color: #f0f9ff;
    }

    .notif-item-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-item-body {
      flex: 1;
      min-width: 0;

      .notif-item-title {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        line-height: 1.4;
      }

      .notif-item-content {
        font-size: 12px;
        color: #909399;
        line-height: 1.4;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .notif-item-time {
        font-size: 11px;
        color: #c0c4cc;
        margin-top: 4px;
      }
    }

    .notif-item-dot {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f56c6c;
      margin-top: 6px;
    }
  }
}

.notif-footer {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;

  .notif-footer-text {
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>