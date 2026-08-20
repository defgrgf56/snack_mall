// pages/review-submit/review-submit.js
Page({
  data: {
    orderItemId: null,
    orderItem: null,
    rating: 5,
    ratingText: '非常满意',
    content: '',
    images: [],
    isAnonymous: false
  },

  onLoad(options) {
    if (options.orderItemId) {
      this.setData({ orderItemId: options.orderItemId })
      this.loadOrderItem()
    }
  },

  /**
   * 加载订单商品信息
   */
  loadOrderItem() {
    const app = getApp()
    
    wx.request({
      url: `${app.globalData.apiBase}/reviews/pending`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const orderItems = res.data.data || []
          const orderItem = orderItems.find(item => item.id == this.data.orderItemId)
          
          if (orderItem) {
            this.setData({ orderItem })
          } else {
            wx.showToast({
              title: '订单商品不存在',
              icon: 'none'
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          }
        }
      },
      fail: (error) => {
        console.error('加载订单商品失败:', error)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 点击星级评分
   */
  onRatingTap(e) {
    const rating = e.currentTarget.dataset.rating
    const ratingTexts = {
      1: '非常不满意',
      2: '不满意',
      3: '一般',
      4: '满意',
      5: '非常满意'
    }
    
    this.setData({
      rating,
      ratingText: ratingTexts[rating]
    })
  },

  /**
   * 输入评价内容
   */
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  /**
   * 选择图片
   */
  onChooseImage() {
    const remainCount = 9 - this.data.images.length
    
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        
        // 上传图片
        this.uploadImages(tempFilePaths)
      }
    })
  },

  /**
   * 上传图片
   */
  async uploadImages(filePaths) {
    wx.showLoading({ title: '上传中...' })
    
    const app = getApp()
    const uploadedUrls = []
    
    try {
      for (const filePath of filePaths) {
        const url = await this.uploadSingleImage(filePath)
        if (url) {
          uploadedUrls.push(url)
        }
      }
      
      this.setData({
        images: [...this.data.images, ...uploadedUrls]
      })
      
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
    }
  },

  /**
   * 上传单张图片
   */
  uploadSingleImage(filePath) {
    const app = getApp()
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.apiBase}/upload/image`,
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
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
  },

  /**
   * 删除图片
   */
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  /**
   * 切换匿名
   */
  onAnonymousChange(e) {
    this.setData({
      isAnonymous: e.detail.value
    })
  },

  /**
   * 提交评价
   */
  onSubmit() {
    const { orderItemId, rating, content, images, isAnonymous } = this.data
    
    if (!orderItemId) {
      wx.showToast({
        title: '订单商品信息错误',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '提交中...' })
    
    const app = getApp()
    
    wx.request({
      url: `${app.globalData.apiBase}/reviews`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`,
        'Content-Type': 'application/json'
      },
      data: {
        order_item_id: orderItemId,
        rating,
        content,
        images,
        is_anonymous: isAnonymous ? 1 : 0
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '评价成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data?.message || '评价失败',
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        wx.hideLoading()
        console.error('提交评价失败:', error)
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        })
      }
    })
  }
})
