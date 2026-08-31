// pages/address-list/address-list.js - 重构后的地址列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    addressList: [],
    selectMode: false,  // 是否为选择地址模式
    currentAddressId: null  // 当前选中的地址ID
  },

  onLoad(options) {
    // 检查是否为选择地址模式（从结算页面跳转过来）
    const selectMode = options.select === '1'
    const currentAddressId = options.currentId || null
    
    this.setData({
      selectMode,
      currentAddressId
    })
  },

  onShow() {
    // 每次显示时刷新地址列表
    this.loadAddressList()
  },

  /**
   * 加载地址列表
   */
  async loadAddressList() {
    try {
      const result = await this.loadData(
        () => app.api.address.getAddressList(),
        { showLoading: true }
      )

      const addressList = result || []
      this.setData({ addressList })
      this.setPageEmpty(addressList.length === 0)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 选择地址
   */
  onSelectAddress(e) {
    if (!this.data.selectMode) return

    const { id } = e.currentTarget.dataset
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]

    if (prevPage) {
      // 将选中的地址传递给上一个页面
      prevPage.onAddressSelected && prevPage.onAddressSelected(id)
    }

    wx.navigateBack()
  },

  /**
   * 设置默认地址
   */
  async onSetDefault(e) {
    const { id } = e.currentTarget.dataset

    try {
      await app.api.address.setDefaultAddress(id)
      errorHandler.showSuccess('已设为默认地址')
      this.loadAddressList()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 编辑地址
   */
  onEditAddress(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    })
  },

  /**
   * 删除地址
   */
  async onDeleteAddress(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      content: '确定删除该地址吗？'
    })

    if (!confirmed) return

    try {
      await app.api.address.deleteAddress(id)
      errorHandler.showSuccess('删除成功')
      this.loadAddressList()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 添加新地址
   */
  onAddAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    })
  }
}))