<template>
  <el-container class="layout-container" :class="{ 'meteor-mode': meteorEnabled }">
    <!-- 流星雨背景（全屏覆盖） -->
    <MeteorShower :enabled="meteorEnabled" :max-meteors="15" :star-count="100" />

    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside" :class="{ 'is-collapsed': isCollapsed }">
      
      <!-- Logo 区域 -->
      <div class="logo">
        <div class="logo-icon">
          <el-icon :size="24"><ShoppingBag /></el-icon>
        </div>
        <transition name="fade-text">
          <h3 v-show="!isCollapsed" class="logo-text">零食商城</h3>
        </transition>
      </div>

      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon :size="16">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="aside-menu"
        :router="true"
        :collapse="isCollapsed"
        :collapse-transition="false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>

        <el-sub-menu index="product">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/categories">商品分类</el-menu-item>
          <el-menu-item index="/reviews">
            <span>商品评价</span>
            <el-badge v-if="reviewBadge > 0" :value="reviewBadge" :max="99" class="menu-badge" />
          </el-menu-item>
          <el-menu-item index="/favorites">商品收藏</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>
            <span>订单管理</span>
            <el-badge v-if="orderBadge > 0" :value="orderBadge" :max="99" class="menu-badge" />
          </template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-sub-menu index="marketing">
          <template #title>
            <el-icon><Promotion /></el-icon>
            <span>营销管理</span>
          </template>
          <el-menu-item index="/coupons">优惠券</el-menu-item>
          <el-menu-item index="/banners">轮播图</el-menu-item>
          <el-menu-item index="/marketing/activities">活动专区</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admins">管理员</el-menu-item>
          <el-menu-item index="/settings">系统配置</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <!-- 底部管理员信息 -->
      <div class="sidebar-footer">
        <el-tooltip :content="isCollapsed ? (userInfo.username || '管理员') : ''" placement="right" :disabled="!isCollapsed">
          <div class="admin-card" :class="{ 'is-collapsed': isCollapsed }">
            <div class="admin-avatar-wrap">
              <el-avatar :size="36" class="admin-avatar">
                {{ (userInfo.username || 'A')[0].toUpperCase() }}
              </el-avatar>
              <span class="online-dot"></span>
            </div>
            <transition name="fade-text">
              <div v-show="!isCollapsed" class="admin-info">
                <div class="admin-name">{{ userInfo.username || '管理员' }}</div>
                <div class="admin-role">
                  <el-icon :size="12"><Stamp /></el-icon>
                  <span>系统管理员</span>
                </div>
              </div>
            </transition>
          </div>
        </el-tooltip>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 流星雨开关 -->
          <el-tooltip :content="meteorEnabled ? '关闭流星雨' : '开启流星雨'" placement="bottom">
            <el-switch
              v-model="meteorEnabled"
              class="meteor-toggle"
              :active-icon="MeteorIcon"
              :inactive-icon="MeteorIcon"
              inline-prompt
            />
          </el-tooltip>
          <NotificationBell />
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ userInfo.username || '管理员' }}
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, ShoppingBag, Stamp, Sunny, Moon } from '@element-plus/icons-vue'
import NotificationBell from '@/components/NotificationBell.vue'
import MeteorShower from '@/components/MeteorShower.vue'
import { useNotificationStore } from '@/stores/notification'
import { useMeteorShower } from '@/composables/useMeteorShower'

const route = useRoute()
const router = useRouter()
const notifStore = useNotificationStore()
const { enabled: meteorEnabled, toggle: toggleMeteor } = useMeteorShower()

// 流星图标组件
const MeteorIcon = {
  render() {
    return h(Sunny, { style: { color: meteorEnabled.value ? '#f97316' : '#94a3b8' } })
  }
}

// 侧边栏折叠状态（持久化到 localStorage）
const isCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

// 菜单角标数据
const orderBadge = ref(0)
const reviewBadge = ref(0)

// 获取待处理数量（实际应调用后端 API）
const fetchBadges = async () => {
  try {
    // TODO: 替换为真实 API
    // const res = await getUnprocessedCounts()
    // orderBadge.value = res.pendingOrders || 0
    // reviewBadge.value = res.pendingReviews || 0
  } catch (e) {
    // 静默
  }
}

const activeMenu = computed(() => route.path)

// 从 localStorage 获取用户信息
const getUserInfo = () => {
  try {
    const saved = localStorage.getItem('admin_info')
    if (saved && saved !== 'undefined') {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
  return {}
}

const userInfo = getUserInfo()

// 页面挂载时连接 WebSocket 并拉取未读数
onMounted(() => {
  notifStore.fetchUnreadCount()
  notifStore.connect()
  fetchBadges()
})

// 页面卸载时断开 WebSocket
onUnmounted(() => {
  notifStore.disconnect()
})

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    }).then(() => {
      notifStore.disconnect()
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      router.push('/login')
    })
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.layout-aside {
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // Logo 区域
  .logo {
    position: relative;
    z-index: 1;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;

    .logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .logo-text {
      margin: 0;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
  }

  // 折叠按钮
  .collapse-btn {
    position: relative;
    z-index: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.45);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.85);
    }
  }

  // 菜单样式
  .aside-menu {
    position: relative;
    z-index: 1;
    border-right: none;
    background: transparent;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: rgba(255, 255, 255, 0.65);
      height: 44px;
      line-height: 44px;
      margin: 2px 8px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
    }

    :deep(.el-menu-item.is-active) {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
      color: #60a5fa;
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: linear-gradient(180deg, #3b82f6, #8b5cf6);
        border-radius: 0 3px 3px 0;
      }
    }

    // 二级菜单样式
    :deep(.el-sub-menu) {
      .el-menu {
        background: transparent;
      }

      .el-menu-item {
        background: transparent;
        min-width: auto;
        padding-left: 48px !important;
        height: 40px;
        line-height: 40px;
        font-size: 13px;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        &.is-active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
      }
    }

    // 折叠状态 - 统一图标居中
    &.el-menu--collapse {
      width: 64px;
      padding: 8px 0;

      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 64px;
        height: 44px;
        margin: 2px 0;

        // 隐藏箭头占位符，消除不对齐
        .el-sub-menu__icon-arrow {
          display: none;
        }
      }

      // 折叠态 tooltip 弹出位置微调
      :deep(.el-menu-item),
      :deep(.el-sub-menu) {
        position: relative;
      }
    }
  }

  // 底部管理员信息
  .sidebar-footer {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px;

    .admin-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      &.is-collapsed {
        justify-content: center;
        padding: 12px 0;
      }

      .admin-avatar-wrap {
        position: relative;
        flex-shrink: 0;

        .admin-avatar {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border: 2px solid #1e293b;
          border-radius: 50%;
        }
      }

      .admin-info {
        overflow: hidden;

        .admin-name {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
        }

        .admin-role {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          line-height: 1.4;
        }
      }
    }
  }
}

.layout-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  padding: 0 24px;
  height: 64px;
  transition: background-color 0.6s ease, border-color 0.6s ease, color 0.6s ease;

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    // 流星雨开关样式
    .meteor-toggle {
      --el-switch-on-color: #f97316;
      --el-switch-off-color: #e2e8f0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        color: #3b82f6;
      }
    }
  }
}

.layout-main {
  position: relative;
  z-index: 1;
  background: var(--page-bg);
  padding: 24px;
  transition: background-color 0.6s ease;
}

// 流星雨暗色模式：半透明容器，星空流星透出
.meteor-mode {
  .layout-aside {
    background: rgba(15, 23, 42, 0.55) !important;

    .logo {
      background: rgba(255, 255, 255, 0.05);
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }

    .collapse-btn {
      border-bottom-color: rgba(255, 255, 255, 0.06);
    }

    .sidebar-footer {
      border-top-color: rgba(255, 255, 255, 0.06);

      .online-dot {
        border-color: rgba(15, 23, 42, 0.55);
      }
    }
  }

  .layout-header {
    background: rgba(15, 23, 42, 0.55);
    border-bottom-color: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;

    .header-left {
      color: #cbd5e1;
    }

    .header-right {
      .user-info {
        color: #e2e8f0;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #60a5fa;
        }
      }
    }
  }

  .layout-main {
    background: rgba(15, 23, 42, 0.55);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 文字淡入淡出
.fade-text-enter-active,
.fade-text-leave-active {
  transition: all 0.2s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

// 菜单角标样式
.menu-badge {
  margin-left: 8px;

  :deep(.el-badge__content) {
    position: static;
    transform: none;
  }
}
</style>

<!-- 非 scoped：全局主题变量 + 子组件 Element Plus 覆盖 -->
<style lang="scss">
/* 浅色主题变量（默认） */
:root {
  --page-bg: #f8fafc;
  --search-bg: #f5f7fa;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-light: #e5e7eb;
  --white: #ffffff;
}

/* 流星模式：深蓝玻璃质感 */
.meteor-mode {
  --page-bg: rgba(12, 18, 40, 0.82);
  --search-bg: rgba(20, 30, 65, 0.7);
  --text-primary: #e2e8f0;
  --text-regular: #cbd5e1;
  --text-secondary: #94a3b8;
  --border-light: rgba(80, 120, 220, 0.18);
  --white: rgba(12, 18, 40, 0.82);

  // Element Plus 容器：深蓝玻璃底
  .el-aside,
  .el-header,
  .el-main {
    background: rgba(12, 18, 40, 0.82) !important;
  }

  // 卡片：稍亮于底色 + 蓝色微光边框
  .el-card {
    background: rgba(16, 24, 50, 0.85) !important;
    border: 1px solid rgba(80, 130, 255, 0.15) !important;
    box-shadow: 0 0 20px rgba(50, 100, 220, 0.08), inset 0 0 1px rgba(100, 160, 255, 0.06);
    border-radius: 12px;

    .el-card__header {
      border-bottom: 1px solid rgba(80, 130, 255, 0.12);
      color: #e2e8f0;
    }

    .el-card__body {
      color: #e2e8f0;
    }
  }

  // 表格
  .el-table {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: rgba(20, 30, 65, 0.5);
    --el-table-row-hover-bg-color: rgba(50, 80, 160, 0.12);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #94a3b8;
    --el-table-border-color: rgba(80, 130, 255, 0.1);
    --el-table-current-row-bg-color: rgba(59, 130, 246, 0.15);

    &::before,
    &::after {
      display: none;
    }

    // 空状态
    .el-table__empty-block {
      background: transparent;
    }
  }

  // 统计数值文字
  .stat-value,
  .indicator-value,
  .order-stat-item .value {
    color: #f1f5f9 !important;
  }

  .stat-label,
  .indicator-label,
  .order-stat-item .label,
  .card-subtitle {
    color: #94a3b8 !important;
  }

  .card-title,
  .card-header > span {
    color: #e2e8f0 !important;
  }

  // 指标卡片背景
  .chart-indicators {
    background: rgba(255, 255, 255, 0.06) !important;
  }

  // 空状态占位
  .chart-empty {
    background: rgba(255, 255, 255, 0.04) !important;
  }

  // 输入框 / 选择器
  .el-input__wrapper,
  .el-select__wrapper {
    background: rgba(30, 41, 59, 0.8) !important;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
  }

  .el-input__inner,
  .el-select__placeholder,
  .el-select__selected-item {
    color: #e2e8f0 !important;
  }

  // Tag
  .el-tag {
    border-color: rgba(255, 255, 255, 0.1);
  }

  // 分页
  .el-pagination {
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #94a3b8;
    --el-pagination-button-disabled-bg-color: transparent;
  }

  // Dropdown
  .el-dropdown-menu {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(255, 255, 255, 0.08);

    .el-dropdown-menu__item {
      color: #e2e8f0;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }

  // Tooltip
  .el-popper.is-dark {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(255, 255, 255, 0.08);
  }

  // Breadcrumb
  .el-breadcrumb__inner {
    color: #94a3b8;

    &.is-link:hover {
      color: #60a5fa;
    }
  }

  .el-breadcrumb__separator {
    color: #64748b;
  }
}
</style>