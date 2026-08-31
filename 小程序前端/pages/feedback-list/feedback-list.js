// pages/feedback-list/feedback-list.js
const app = getApp()
const API = require('../../services/api/index')
const { createPageMixin } = require('../../mixins/page-mixin')

const pageMixin = createPageMixin()

Page({
  data: {
    ...pageMixin.data,
    feedbackList: [],
    statusMap: {
      1: { text: '待处理', color: '#FF6B00' },
      2: { text: '处理中', color: '#1890ff' },
      3: { text: '已回复', color: '#52c41a' },
      4: { text: '已关闭', color: '#999' }
    },
    typeMap: {
      1: '功能建议',
      2: 'Bug反馈',
      3: '产品咨询',
      4: '投诉建议',
      5: '其他'
    }
  },

  onLoad() {
    if (pageMixin.onLoad) {
      pageMixin.onLoad.call(this, arguments[0])
    }
    this.loadList()
  },

  onShow() {
    if (pageMixin.onShow) {
      pageMixin.onShow.call(this)
    }
  },

  onUnload() {
    if (pageMixin.onUnload) {
      pageMixin.onUnload.call(this)
    }
  },

  onPullDownRefresh() {
    this.loadList()
  },

  onReachBottom() {
    this.loadMore()
  },

  // 加载列表
  loadList() {
    if (this.loadListData) {
      this.loadListData((page, pageSize) => {
        return API.feedback.getFeedbackList({ page, pageSize })
      }, (items) => {
        this.setData({ feedbackList: items })
        wx.stopPullDownRefresh()
      })
    }
  },

  // 加载更多
  loadMore() {
    if (!this.data._listHasMore || this.data._listLoading) {
      return
    }

    if (this.loadListData) {
      this.loadListData((page, pageSize) => {
        return API.feedback.getFeedbackList({ page, pageSize })
      }, (items) => {
        this.setData({
          feedbackList: [...this.data.feedbackList, ...items]
        })
      })
    }
  },

  // 查看详情
  onViewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/feedback-detail/feedback-detail?id=${id}`
    })
  },

  // 删除反馈
  async onDelete(e) {
    const { id, index } = e.currentTarget.dataset

    const res = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '删除后将无法恢复',
        confirmColor: '#FF6B00',
        success: resolve
      })
    })

    if (!res.confirm) return

    wx.showLoading({ title: '删除中...' })

    try {
      await API.feedback.deleteFeedback(id)
      
      // 从列表中移除
      const feedbackList = [...this.data.feedbackList]
      feedbackList.splice(index, 1)
      this.setData({ feedbackList })

      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }

    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }

    // 小于1天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }

    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`
    }

    // 格式化日期
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (year === now.getFullYear()) {
      return `${month}-${day}`
    }
    
    return `${year}-${month}-${day}`
  }
})