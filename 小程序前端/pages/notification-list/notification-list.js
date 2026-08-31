// pages/notification-list/notification-list.js - 重构后的通知列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    tabs: [
      { label: '全部', value: '' },
      { label: '订单通知', value: 'order' },
      { label: '优惠活动', value: 'activity' },
      { label: '系统公告', value: 'system' }
    ],
    currentTab: '',
    notificationList: [],
    unreadCount: 0,
    
    // 列表分页
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad(options) {
    this.loadUnreadCount()
  },

  onShow() {
    this.loadNotifications()
    this.loadUnreadCount()
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    if (tab === this.data.currentTab) return

    this.setData({ 
      currentTab: tab,
      page: 1,
      hasMore: true,
      notificationList: []
    })
    this.loadNotifications()
  },

  /**
   * 加载通知列表
   */
  async loadNotifications() {
    // 没有更多数据
    if (!this.data.hasMore) {
      return
    }

    const params = {
      page: this.data.page,
      limit: this.data.pageSize
    }

    // 添加类型筛选
    if (this.data.currentTab !== '') {
      params.type = this.data.currentTab
    }

    try {
      const result = await this.loadData(
        () => app.api.notification.getNotifications(params),
        { showLoading: this.data.page === 1 }
      )

      const items = result.list || []
      const notificationList = this.data.page === 1 
        ? items 
        : [...this.data.notificationList, ...items]

      this.setData({
        notificationList,
        page: this.data.page + 1,
        hasMore: items.length >= this.data.pageSize
      })

      this.setPageEmpty(notificationList.length === 0)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 加载未读数量
   */
  async loadUnreadCount() {
    try {
      const result = await app.api.notification.getUnreadCount()
      const count = result.count || 0
      
      this.setData({ unreadCount: count })

      // 更新TabBar角标
      if (count > 0) {
        wx.setTabBarBadge({
          index: 3,
          text: count > 99 ? '99+' : String(count)
        })
      } else {
        wx.removeTabBarBadge({ index: 3 })
      }
    } catch (error) {
      // 静默失败
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      notificationList: []
    })
    await this.loadNotifications()
    await this.loadUnreadCount()
    wx.stopPullDownRefresh()
  },

  /**
   * 上拉加载更多
   */
  async onReachBottom() {
    if (this.data.hasMore && !this.data._pageLoading) {
      await this.loadNotifications()
    }
  },

  /**
   * 点击消息
   */
  async onItemTap(e) {
    const { item } = e.currentTarget.dataset

    // 如果未读，标记为已读
    if (item.is_read === 0) {
      await this.markRead(item.id)
    }

    // 跳转到相关页面
    if (item.type === 'order' && item.related_id) {
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?id=${item.related_id}`
      })
    }
  },

  /**
   * 标记已读
   */
  async markRead(id) {
    try {
      await app.api.notification.markRead(id)

      // 更新本地数据
      const list = this.data.notificationList.map(item => {
        if (item.id === id) {
          return { ...item, is_read: 1 }
        }
        return item
      })

      this.setData({
        notificationList: list,
        unreadCount: Math.max(0, this.data.unreadCount - 1)
      })
    } catch (error) {
      // 静默失败
    }
  },

  /**
   * 标记全部已读
   */
  async markAllRead() {
    try {
      await app.api.notification.markAllRead()
      errorHandler.showSuccess('全部已读')
      
      // 刷新列表
      this.setData({
        page: 1,
        hasMore: true,
        notificationList: []
      })
      await this.loadNotifications()
      await this.loadUnreadCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 删除消息
   */
  async deleteNotification(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      title: '确认删除',
      content: '确定删除这条消息吗?'
    })

    if (!confirmed) return

    try {
      await app.api.notification.deleteNotification(id)
      errorHandler.showSuccess('删除成功')

      // 刷新列表
      this.setData({
        page: 1,
        hasMore: true,
        notificationList: []
      })
      await this.loadNotifications()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 清空已读消息
   */
  async clearRead() {
    const confirmed = await errorHandler.confirm({
      title: '确认清空',
      content: '确定清空所有已读消息吗?'
    })

    if (!confirmed) return

    try {
      await app.api.notification.clearRead()
      errorHandler.showSuccess('清空成功')

      // 刷新列表
      this.setData({
        page: 1,
        hasMore: true,
        notificationList: []
      })
      await this.loadNotifications()
    } catch (error) {
      // 错误已统一处理
    }
  }
}))