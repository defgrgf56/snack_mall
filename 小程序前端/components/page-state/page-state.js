// components/page-state/page-state.js

Component({
  properties: {
    // 状态：loading | loaded | empty | error
    state: {
      type: String,
      value: 'loading'
    },
    // 加载文本
    loadingText: {
      type: String,
      value: '加载中...'
    },
    // 空状态图标
    emptyIcon: {
      type: String,
      value: ''
    },
    // 空状态文本
    emptyText: {
      type: String,
      value: '暂无数据'
    },
    // 是否显示空状态按钮
    showEmptyButton: {
      type: Boolean,
      value: false
    },
    // 空状态按钮文本
    emptyButtonText: {
      type: String,
      value: '去逛逛'
    },
    // 错误图标
    errorIcon: {
      type: String,
      value: ''
    },
    // 错误消息
    errorMessage: {
      type: String,
      value: '加载失败，请稍后重试'
    }
  },

  methods: {
    /**
     * 重试
     */
    onRetry() {
      this.triggerEvent('retry')
    },

    /**
     * 空状态按钮点击
     */
    onEmptyButtonTap() {
      this.triggerEvent('emptyButtonTap')
    }
  }
})