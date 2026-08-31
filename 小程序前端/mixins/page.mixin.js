// mixins/page.mixin.js - 通用页面 Mixin

import store from '../store/index'

/**
 * 页面加载状态枚举
 */
export const PAGE_STATE = {
  LOADING: 'loading',
  LOADED: 'loaded',
  EMPTY: 'empty',
  ERROR: 'error',
}

/**
 * 通用页面 Mixin
 * 
 * 使用方式:
 * import { createPage } from '../../mixins/page.mixin'
 * 
 * createPage({
 *   data: {},
 *   onLoad() {},
 *   // ...
 * })
 */
export function createPage(options) {
  const originalOnLoad = options.onLoad
  const originalOnShow = options.onShow
  const originalOnUnload = options.onUnload

  return Page({
    data: {
      // Mixin 注入的数据
      __pageState: PAGE_STATE.LOADING,
      __errorMessage: '',
      ...options.data,
    },

    /**
     * 设置页面状态
     */
    setPageState(state, errorMessage = '') {
      this.setData({
        __pageState: state,
        __errorMessage: errorMessage,
      })
    },

    /**
     * 设置加载状态
     */
    setLoading() {
      this.setPageState(PAGE_STATE.LOADING)
    },

    /**
     * 设置加载完成
     */
    setLoaded() {
      this.setPageState(PAGE_STATE.LOADED)
    },

    /**
     * 设置空状态
     */
    setEmpty() {
      this.setPageState(PAGE_STATE.EMPTY)
    },

    /**
     * 设置错误状态
     */
    setError(message = '加载失败，请稍后重试') {
      this.setPageState(PAGE_STATE.ERROR, message)
    },

    /**
     * 检查是否登录
     */
    checkLogin() {
      return store.isLoggedIn()
    },

    /**
     * 需要登录才能执行的操作
     */
    requireLogin(callback) {
      if (this.checkLogin()) {
        callback && callback()
        return true
      } else {
        wx.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/user/user' })
            }
          },
        })
        return false
      }
    },

    /**
     * 安全的异步操作
     * 自动处理 loading 和错误
     */
    async safeAsync(asyncFn, options = {}) {
      const {
        showLoading = false,
        loadingText = '加载中...',
        showError = true,
        errorText = '操作失败',
        finallyFn = null,
      } = options

      try {
        if (showLoading) {
          wx.showLoading({ title: loadingText, mask: true })
        }

        const result = await asyncFn()
        
        if (showLoading) {
          wx.hideLoading()
        }

        return result
      } catch (error) {
        if (showLoading) {
          wx.hideLoading()
        }

        console.error('异步操作失败:', error)

        if (showError) {
          wx.showToast({
            title: error.message || errorText,
            icon: 'none',
          })
        }

        throw error
      } finally {
        if (finallyFn) {
          finallyFn()
        }
      }
    },

    /**
     * 显示成功提示
     */
    showSuccess(message = '操作成功', duration = 1500) {
      wx.showToast({
        title: message,
        icon: 'success',
        duration,
      })
    },

    /**
     * 显示失败提示
     */
    showError(message = '操作失败', duration = 2000) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration,
      })
    },

    /**
     * 显示确认对话框
     */
    showConfirm(content, title = '提示') {
      return new Promise((resolve) => {
        wx.showModal({
          title,
          content,
          success: (res) => {
            resolve(res.confirm)
          },
        })
      })
    },

    /**
     * 防抖函数
     */
    debounce(fn, delay = 300) {
      if (this.__debounceTimer) {
        clearTimeout(this.__debounceTimer)
      }
      this.__debounceTimer = setTimeout(() => {
        fn.call(this)
      }, delay)
    },

    /**
     * 节流函数
     */
    throttle(fn, delay = 300) {
      const now = Date.now()
      if (!this.__throttleLastTime || now - this.__throttleLastTime > delay) {
        this.__throttleLastTime = now
        fn.call(this)
      }
    },

    onLoad(options) {
      // 初始化状态订阅
      this.__unsubscribers = []

      // 执行原始 onLoad
      if (originalOnLoad) {
        originalOnLoad.call(this, options)
      }
    },

    onShow() {
      // 执行原始 onShow
      if (originalOnShow) {
        originalOnShow.call(this)
      }
    },

    onUnload() {
      // 清理定时器
      if (this.__debounceTimer) {
        clearTimeout(this.__debounceTimer)
      }

      // 清理订阅
      if (this.__unsubscribers) {
        this.__unsubscribers.forEach(unsubscribe => unsubscribe())
        this.__unsubscribers = []
      }

      // 执行原始 onUnload
      if (originalOnUnload) {
        originalOnUnload.call(this)
      }
    },

    // 合并用户定义的方法
    ...options,
  })
}

/**
 * 列表页面 Mixin
 * 用于需要分页加载的列表页面
 */
export function createListPage(options) {
  const originalOnLoad = options.onLoad
  const originalOnReachBottom = options.onReachBottom

  return createPage({
    data: {
      // 列表相关数据
      __list: [],
      __page: 1,
      __pageSize: 10,
      __hasMore: true,
      __listLoading: false,
      ...options.data,
    },

    /**
     * 加载列表数据
     * 需要子类实现 loadListData 方法
     */
    async loadList(isRefresh = false) {
      if (this.__listLoading) return
      if (!isRefresh && !this.data.__hasMore) return

      this.__listLoading = true
      this.setData({ __listLoading: true })

      try {
        const page = isRefresh ? 1 : this.data.__page
        const result = await this.loadListData(page, this.data.__pageSize)

        const list = isRefresh ? result.items : [...this.data.__list, ...result.items]
        const hasMore = result.items.length >= this.data.__pageSize

        this.setData({
          __list: list,
          __page: page + 1,
          __hasMore: hasMore,
          __listLoading: false,
        })

        // 设置页面状态
        if (list.length === 0) {
          this.setEmpty()
        } else {
          this.setLoaded()
        }

        return list
      } catch (error) {
        console.error('加载列表失败:', error)
        this.setData({ __listLoading: false })
        
        if (this.data.__list.length === 0) {
          this.setError(error.message || '加载失败')
        }
        
        throw error
      }
    },

    /**
     * 刷新列表
     */
    async refreshList() {
      return this.loadList(true)
    },

    /**
     * 加载更多
     */
    async loadMore() {
      return this.loadList(false)
    },

    onLoad(options) {
      // 执行原始 onLoad
      if (originalOnLoad) {
        originalOnLoad.call(this, options)
      }

      // 自动加载列表
      this.loadList(true)
    },

    onReachBottom() {
      // 执行原始 onReachBottom
      if (originalOnReachBottom) {
        originalOnReachBottom.call(this)
      }

      // 自动加载更多
      this.loadMore()
    },

    onPullDownRefresh() {
      this.refreshList().then(() => {
        wx.stopPullDownRefresh()
      })
    },

    ...options,
  })
}