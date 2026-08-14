// pages/user/user.js
const api = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    orderStats: {
      pending: 0,
      paid: 0,
      shipped: 0,
      uncommented: 0
    }
  },

  onLoad(options) {
    this.loadUserData();
  },

  onShow() {
    this.loadUserData();
  },

  // 加载用户数据
  async loadUserData() {
    const token = wx.getStorageSync('token');
    
    if (!token) {
      this.setData({
        userInfo: null
      });
      return;
    }
    
    try {
      // 加载用户信息
      const userRes = await api.get('/user/info')
      const statsRes = await api.get('/orders/stats')

      this.setData({
        userInfo: userRes,
        orderStats: {
          pending: statsRes.pending || 0,
          paid: statsRes.paid || 0,
          shipped: statsRes.shipped || 0,
          uncommented: statsRes.uncommented || 0
        }
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      
      // 如果是401错误，清除token
      if (error.statusCode === 401) {
        wx.removeStorageSync('token');
        this.setData({
          userInfo: null
        });
      } else {
        // 使用模拟数据
        this.useMockData();
      }
    }
  },

  /**
   * 登录
   */
  async onLogin() {
    try {
      const app = getApp()
      
      // 检查是否为真实AppID（非游客模式）
      const accountInfo = wx.getAccountInfoSync()
      const isRealAppId = accountInfo.miniProgram.appId && 
                         !accountInfo.miniProgram.appId.startsWith('wx')
      
      // 游客模式或开发环境：简化登录流程
      if (!isRealAppId || accountInfo.miniProgram.envVersion === 'develop') {
        wx.showLoading({ title: '登录中...' })
        
        // 直接调用后端登录（不需要getUserProfile）
        await app.login()
        
        // 模拟用户信息
        app.globalData.userInfo = {
          nickname: '测试用户',
          avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
          ...app.globalData.userInfo
        }
        
        wx.hideLoading()
        
        // 刷新页面数据
        this.loadUserData()
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        return
      }
      
      // 真实环境：使用 getUserProfile 获取用户信息授权
      const profileRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      // 调用app.js的登录方法
      await app.login()
      
      // 更新用户资料
      if (profileRes.userInfo) {
        await this.updateUserProfile(profileRes.userInfo)
      }
      
      // 刷新页面数据
      this.loadUserData()
      
    } catch (error) {
      console.error('登录失败:', error)
      
      if (error.errMsg && error.errMsg.includes('getUserProfile:fail auth deny')) {
        wx.showToast({
          title: '您取消了授权',
          icon: 'none'
        })
      } else if (error.errMsg && error.errMsg.includes('getUserProfile:fail')) {
        // 游客模式下getUserProfile失败，使用简化登录
        wx.showModal({
          title: '提示',
          content: '当前为开发模式，将使用测试账号登录',
          showCancel: false,
          success: async () => {
            try {
              const app = getApp()
              await app.login()
              
              // 使用默认用户信息
              app.globalData.userInfo = {
                nickname: '测试用户',
                avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
                ...app.globalData.userInfo
              }
              
              this.loadUserData()
              
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
            } catch (e) {
              wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    }
  },
  
  /**
   * 更新用户资料
   */
  async updateUserProfile(profile) {
    try {
      await api.post('/auth/update-profile', {
        nickname: profile.nickName,
        avatar: profile.avatarUrl,
        gender: profile.gender
      })
      
      // 更新全局用户信息
      const app = getApp()
      if (app.globalData.userInfo) {
        app.globalData.userInfo.nickname = profile.nickName
        app.globalData.userInfo.avatar = profile.avatarUrl
      }
      
    } catch (error) {
      console.error('更新用户资料失败:', error)
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          this.setData({
            userInfo: null,
            orderStats: {
              pending: 0,
              paid: 0,
              shipped: 0,
              uncommented: 0
            }
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看订单列表
  onViewOrders(e) {
    const status = e.currentTarget.dataset.status;
    
    if (!this.data.userInfo) {
      this.onLogin();
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order-list/order-list?status=${status}`
    });
  },

  // 查看全部订单
  onViewAllOrders() {
    if (!this.data.userInfo) {
      this.onLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/order-list/order-list'
    });
  },

  // 页面导航
  onNavigate(e) {
    const url = e.currentTarget.dataset.url;
    
    if (!this.data.userInfo) {
      this.onLogin();
      return;
    }
    
    wx.navigateTo({
      url
    });
  },

  // 联系客服
  onContact() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 使用模拟数据
  useMockData() {
    const mockUser = {
      id: 1,
      nickname: '零食爱好者',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '138****8888',
      is_vip: true,
      points: 1280,
      coupon_count: 5
    };
    
    const mockStats = {
      pending: 1,
      paid: 2,
      shipped: 1,
      uncommented: 3
    };
    
    this.setData({
      userInfo: mockUser,
      orderStats: mockStats
    });
  }
});
