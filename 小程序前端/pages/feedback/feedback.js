// pages/feedback/feedback.js
const app = getApp()
const API = require('../../services/api/index')

Page({
  data: {
    typeList: [
      { id: 1, name: '功能建议' },
      { id: 2, name: 'Bug反馈' },
      { id: 3, name: '产品咨询' },
      { id: 4, name: '投诉建议' },
      { id: 5, name: '其他' }
    ],
    selectedType: 1,
    content: '',
    contact: '',
    images: [],
    maxImages: 3,
    submitting: false
  },

  onLoad(options) {
    // 如果传入了type参数，设置默认类型
    if (options.type) {
      this.setData({ selectedType: parseInt(options.type) })
    }
  },

  // 选择反馈类型
  onSelectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ selectedType: type })
  },

  // 输入反馈内容
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({ contact: e.detail.value })
  },

  // 选择图片
  onChooseImage() {
    const { images, maxImages } = this.data
    const count = maxImages - images.length

    if (count <= 0) {
      wx.showToast({
        title: `最多上传${maxImages}张图片`,
        icon: 'none'
      })
      return
    }

    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.uploadImages(tempFilePaths)
      }
    })
  },

  // 上传图片
  async uploadImages(filePaths) {
    wx.showLoading({ title: '上传中...' })

    try {
      const uploadPromises = filePaths.map(filePath => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${app.config.apiBaseUrl}/upload/image`,
            filePath,
            name: 'file',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data)
                if (data.code === 200) {
                  resolve(data.data.url)
                } else {
                  reject(new Error(data.message))
                }
              } catch (e) {
                reject(e)
              }
            },
            fail: reject
          })
        })
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const images = [...this.data.images, ...uploadedUrls]
      this.setData({ images })
      
      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
      console.error('上传图片失败:', error)
    }
  },

  // 预览图片
  onPreviewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: this.data.images,
      current: url
    })
  },

  // 删除图片
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 提交反馈
  async onSubmit() {
    const { selectedType, content, contact, images, submitting } = this.data

    if (submitting) return

    // 验证
    if (!content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    if (content.length < 10) {
      wx.showToast({
        title: '反馈内容至少10个字',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await API.feedback.submitFeedback({
        type: selectedType,
        content: content.trim(),
        contact: contact.trim() || null,
        images: images.length > 0 ? images : null
      })

      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      })
    }
  }
})