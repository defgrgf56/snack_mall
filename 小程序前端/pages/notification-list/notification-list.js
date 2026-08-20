// pages/notification-list/notification-list.js
const { request } = require('../../utils/request');

Page({
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
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    this.loadNotifications();
    this.loadUnreadCount();
  },

  onShow() {
    // 刷新未读数量
    this.loadUnreadCount();
  },

  onPullDownRefresh() {
    this.refreshList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadMore();
    }
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
      notificationList: [],
      page: 1,
      hasMore: true
    });
    this.loadNotifications();
  },

  /**
   * 刷新列表
   */
  async refreshList() {
    this.setData({
      notificationList: [],
      page: 1,
      hasMore: true
    });
    await this.loadNotifications();
    await this.loadUnreadCount();
  },

  /**
   * 加载更多
   */
  async loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    await this.loadNotifications();
  },

  /**
   * 加载通知列表
   */
  async loadNotifications() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };

      // 添加类型筛选
      if (this.data.currentTab !== '') {
        params.type = this.data.currentTab;
      }

      const res = await request({
        url: '/notifications',
        method: 'GET',
        data: params
      });

      if (res.code === 200) {
        const newList = this.data.page === 1 
          ? res.data.list 
          : [...this.data.notificationList, ...res.data.list];

        this.setData({
          notificationList: newList,
          hasMore: res.data.pagination.page < res.data.pagination.totalPages
        });
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载通知列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载未读数量
   */
  async loadUnreadCount() {
    try {
      const res = await request({
        url: '/notifications/unread-count',
        method: 'GET'
      });

      if (res.code === 200) {
        this.setData({
          unreadCount: res.data.count
        });

        // 更新TabBar角标
        if (res.data.count > 0) {
          wx.setTabBarBadge({
            index: 3, // 我的Tab索引
            text: res.data.count > 99 ? '99+' : String(res.data.count)
          });
        } else {
          wx.removeTabBarBadge({
            index: 3
          });
        }
      }
    } catch (error) {
      console.error('加载未读数量失败:', error);
    }
  },

  /**
   * 点击消息
   */
  async onItemTap(e) {
    const { item } = e.currentTarget.dataset;

    // 如果未读,标记为已读
    if (item.is_read === 0) {
      await this.markRead(item.id);
    }

    // 跳转到相关页面
    if (item.type === 'order' && item.related_id) {
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?id=${item.related_id}`
      });
    }
  },

  /**
   * 标记已读
   */
  async markRead(id) {
    try {
      const res = await request({
        url: `/notifications/${id}/read`,
        method: 'PUT'
      });

      if (res.code === 200) {
        // 更新本地数据
        const list = this.data.notificationList.map(item => {
          if (item.id === id) {
            return { ...item, is_read: 1 };
          }
          return item;
        });
        
        this.setData({
          notificationList: list,
          unreadCount: Math.max(0, this.data.unreadCount - 1)
        });
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  },

  /**
   * 标记全部已读
   */
  async markAllRead() {
    try {
      const res = await request({
        url: '/notifications/read-all',
        method: 'PUT'
      });

      if (res.code === 200) {
        wx.showToast({
          title: '全部已读',
          icon: 'success'
        });

        // 刷新列表
        this.refreshList();
      }
    } catch (error) {
      console.error('标记全部已读失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  /**
   * 删除消息
   */
  async deleteNotification(e) {
    const { id } = e.currentTarget.dataset;

    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: '确定删除这条消息吗?',
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) return;

    try {
      const res = await request({
        url: `/notifications/${id}`,
        method: 'DELETE'
      });

      if (res.code === 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        // 刷新列表
        this.refreshList();
      }
    } catch (error) {
      console.error('删除消息失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 清空已读消息
   */
  async clearRead() {
    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认清空',
        content: '确定清空所有已读消息吗?',
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) return;

    try {
      const res = await request({
        url: '/notifications/clear-read',
        method: 'DELETE'
      });

      if (res.code === 200) {
        wx.showToast({
          title: '清空成功',
          icon: 'success'
        });

        // 刷新列表
        this.refreshList();
      }
    } catch (error) {
      console.error('清空消息失败:', error);
      wx.showToast({
        title: '清空失败',
        icon: 'none'
      });
    }
  }
});
