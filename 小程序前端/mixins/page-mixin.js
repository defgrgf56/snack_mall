// mixins/page-mixin.js - 通用页面 Mixin

const logger = require('../utils/logger')

/**
 * 创建页面 Mixin
 */
function createPageMixin(options = {}) {
  return {
    data: {
      // 页面状态
      _pageLoading: false,
      _pageError: null,
      _pageEmpty: false,
      
      // 列表相关
      _listPage: 1,
      _listHasMore: true,
      _listLoading: false,
      
      ...options.data
    },

    onLoad(query) {
      logger.info(`页面加载: ${this.route}`, query)
      
      // 调用原始 onLoad
      if (options.onLoad) {
        options.onLoad.call(this, query)
      }
    },

    onShow() {
      logger.info(`页面显示: ${this.route}`)
      
      // 更新购物车数量
      const app = getApp()
      if (app.store) {
        app.store.updateCartCount()
      }
      
      // 调用原始 onShow
      if (options.onShow) {
        options.onShow.call(this)
      }
    },

    onUnload() {
      logger.info(`页面卸载: ${this.route}`)
      
      // 清理定时器等
      this._cleanup()
      
      // 调用原始 onUnload
      if (options.onUnload) {
        options.onUnload.call(this)
      }
    },

    /**
     * 设置页面加载状态
     */
    setPageLoading(loading) {
      this.setData({ _pageLoading: loading })
    },

    /**
     * 设置页面错误
     */
    setPageError(error) {
      this.setData({
        _pageError: error ? error.message : null,
        _pageLoading: false
      })
    },

    /**
     * 设置页面空状态
     */
    setPageEmpty(empty) {
      this.setData({ _pageEmpty: empty })
    },

    /**
     * 加载数据（支持重试）
     */
    async loadData(loadFn, options = {}) {
      const { showLoading = false, showError = true } = options
      
      try {
        this.setPageLoading(true)
        this.setPageError(null)
        
        if (showLoading) {
          wx.showLoading({ title: '加载中...' })
        }
        
        const result = await loadFn()
        
        // 检查是否为空
        if (Array.isArray(result) && result.length === 0) {
          this.setPageEmpty(true)
        } else {
          this.setPageEmpty(false)
        }
        
        return result
      } catch (error) {
        logger.error('加载数据失败', error)
        if (showError) {
          this.setPageError(error)
        }
        throw error
      } finally {
        this.setPageLoading(false)
        if (showLoading) {
          wx.hideLoading()
        }
      }
    },

    /**
     * 重新加载
     */
    async retry() {
      if (this.loadPageData) {
        await this.loadPageData()
      }
    },

    /**
     * 下拉刷新
     */
    async onPullDownRefresh() {
      try {
        await this.retry()
      } finally {
        wx.stopPullDownRefresh()
      }
    },

    /**
     * 加载列表（支持分页）
     */
    async loadList(loadFn, options = {}) {
      const {
        reset = false,
        pageSize = 10,
        listKey = 'list'
      } = options
      
      // 重置列表
      if (reset) {
        this.setData({
          _listPage: 1,
          _listHasMore: true,
          [listKey]: []
        })
      }
      
      // 没有更多了
      if (!this.data._listHasMore) {
        return
      }
      
      // 正在加载
      if (this.data._listLoading) {
        return
      }
      
      try {
        this.setData({ _listLoading: true })
        
        const result = await loadFn(this.data._listPage, pageSize)
        const items = result.items || result || []
        
        // 合并数据
        const currentList = this.data[listKey] || []
        const newList = reset ? items : [...currentList, ...items]
        
        this.setData({
          [listKey]: newList,
          _listPage: this.data._listPage + 1,
          _listHasMore: items.length >= pageSize,
          _pageEmpty: newList.length === 0
        })
        
        return items
      } catch (error) {
        logger.error('加载列表失败', error)
        throw error
      } finally {
        this.setData({ _listLoading: false })
      }
    },

    /**
     * 上拉加载更多
     */
    async onReachBottom() {
      if (this.loadMoreData) {
        await this.loadMoreData()
      }
    },

    /**
     * 清理资源
     */
    _cleanup() {
      // 清理定时器
      if (this._timers) {
        this._timers.forEach(timer => clearTimeout(timer))
        this._timers = []
      }
      
      if (this._intervals) {
        this._intervals.forEach(interval => clearInterval(interval))
        this._intervals = []
      }
    },

    /**
     * 安全的 setTimeout
     */
    $setTimeout(callback, delay) {
      if (!this._timers) this._timers = []
      const timer = setTimeout(callback, delay)
      this._timers.push(timer)
      return timer
    },

    /**
     * 安全的 setInterval
     */
    $setInterval(callback, delay) {
      if (!this._intervals) this._intervals = []
      const interval = setInterval(callback, delay)
      this._intervals.push(interval)
      return interval
    },

    // 合并用户自定义方法
    ...options
  }
}

module.exports = createPageMixin