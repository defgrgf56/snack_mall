// pages/address-edit/address-edit.js - 重构后的地址编辑页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    addressId: null,
    formData: {
      consignee: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      is_default: false
    },
    regions: ['请选择', '请选择', '请选择']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id })
      this.loadAddress(options.id)
    }
  },

  /**
   * 加载地址详情
   */
  async loadAddress(id) {
    try {
      const address = await this.loadData(
        () => app.api.address.getAddressDetail(id),
        { showLoading: true }
      )

      this.setData({
        formData: {
          consignee: address.consignee || '',
          phone: address.phone || '',
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detail: address.detail || address.address || '',
          is_default: !!address.is_default
        },
        regions: [
          address.province || '请选择',
          address.city || '请选择',
          address.district || '请选择'
        ]
      })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 收货人输入
   */
  onConsigneeInput(e) {
    this.setData({
      'formData.consignee': e.detail.value
    })
  },

  /**
   * 手机号输入
   */
  onPhoneInput(e) {
    // 确保手机号是字符串格式，并去除非数字字符
    const phone = String(e.detail.value || '').replace(/\D/g, '')
    this.setData({
      'formData.phone': phone
    })
  },

  /**
   * 地区选择
   */
  onRegionChange(e) {
    const regions = e.detail.value
    this.setData({
      regions,
      'formData.province': regions[0],
      'formData.city': regions[1],
      'formData.district': regions[2]
    })
  },

  /**
   * 详细地址输入
   */
  onDetailInput(e) {
    this.setData({
      'formData.detail': e.detail.value
    })
  },

  /**
   * 设为默认切换
   */
  onDefaultChange(e) {
    this.setData({
      'formData.is_default': e.detail.value
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data

    if (!formData.consignee || !formData.consignee.trim()) {
      throw new Error('请填写收货人姓名')
    }

    // 确保手机号是字符串格式
    const phone = String(formData.phone || '')
    console.log('[地址编辑] 验证手机号:', phone, '类型:', typeof phone)
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请填写正确的手机号')
    }

    if (!formData.province || formData.province === '请选择' ||
        !formData.city || formData.city === '请选择' ||
        !formData.district || formData.district === '请选择') {
      throw new Error('请选择省市区')
    }

    if (!formData.detail || !formData.detail.trim()) {
      throw new Error('请填写详细地址')
    }

    return true
  },

  /**
   * 保存地址
   */
  async onSave() {
    console.log('[地址编辑] 点击保存按钮')
    
    try {
      // 验证表单
      console.log('[地址编辑] 开始验证表单')
      this.validateForm()
      console.log('[地址编辑] 表单验证通过')

      const { formData, addressId } = this.data
      console.log('[地址编辑] 准备提交数据:', { formData, addressId })

      // 提交数据
      if (addressId) {
        console.log('[地址编辑] 更新地址:', addressId)
        const result = await app.api.address.updateAddress(addressId, formData)
        console.log('[地址编辑] 更新成功:', result)
      } else {
        console.log('[地址编辑] 创建新地址')
        const result = await app.api.address.createAddress(formData)
        console.log('[地址编辑] 创建成功:', result)
      }

      errorHandler.showSuccess('保存成功')
      
      this.$setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('[地址编辑] 保存失败:', error)
      errorHandler.handle(error)
    }
  }
}))