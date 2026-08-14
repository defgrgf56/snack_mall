// pages/address-edit/address-edit.js
const api = require('../../utils/request');

Page({
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
      this.setData({
        addressId: options.id
      });
      this.loadAddress(options.id);
    }
  },

  // 加载地址详情
  async loadAddress(id) {
    try {
      const res = await api.get(`/addresses/${id}`, {}, false);
      const address = res
      
      this.setData({
        formData: {
          consignee: address.consignee,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          detail: address.detail || address.address,
          is_default: !!address.is_default
        },
        regions: [address.province, address.city, address.district]
      });
    } catch (error) {
      console.error('加载地址失败:', error);
    }
  },

  // 姓名输入
  onConsigneeInput(e) {
    this.setData({
      'formData.consignee': e.detail.value
    });
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  // 地区选择
  onRegionChange(e) {
    const regions = e.detail.value;
    this.setData({
      regions,
      'formData.province': regions[0],
      'formData.city': regions[1],
      'formData.district': regions[2]
    });
  },

  // 详细地址输入
  onDetailInput(e) {
    this.setData({
      'formData.detail': e.detail.value
    });
  },

  // 设为默认
  onDefaultChange(e) {
    this.setData({
      'formData.is_default': e.detail.value
    });
  },

  // 保存地址
  async onSave() {
    const { formData, addressId } = this.data;
    
    // 验证
    if (!formData.consignee) {
      wx.showToast({
        title: '请填写收货人姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.province || !formData.city || !formData.district) {
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.detail) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '保存中...' });
      
      if (addressId) {
        // 更新地址
        await api.put(`/addresses/${addressId}`, formData, false);
      } else {
        // 新增地址
        await api.post('/addresses', formData, false);
      }
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存地址失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
