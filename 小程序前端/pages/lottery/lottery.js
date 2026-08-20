// pages/lottery/lottery.js
const api = require('../../utils/request');

Page({
  data: {
    activities: [], // 抽奖活动列表
    currentActivity: null, // 当前选中的活动
    prizes: [], // 奖品列表
    userPoints: 0,
    isRotating: false, // 是否正在旋转
    rotateAngle: 0, // 当前旋转角度
    showResult: false, // 显示结果弹窗
    resultPrize: null, // 中奖结果
    records: [], // 中奖记录
    showRecords: false // 显示中奖记录
  },

  onLoad() {
    this.loadActivities();
    this.loadUserPoints();
  },

  onShow() {
    this.loadUserPoints();
  },

  // 加载抽奖活动列表
  async loadActivities() {
    try {
      const res = await api.get('/lottery/activities', { status: 1 }, false);
      const activities = res.activities || [];
      
      if (activities.length === 0) {
        wx.showToast({
          title: '暂无抽奖活动',
          icon: 'none',
          duration: 2000
        });
      }
      
      this.setData({
        activities,
        currentActivity: activities[0] || null
      });

      if (activities[0]) {
        this.loadPrizes(activities[0].id);
      }
    } catch (error) {
      console.error('加载抽奖活动失败:', error);
      wx.showModal({
        title: '加载失败',
        content: '无法获取抽奖活动，请检查网络后重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.loadActivities();
          }
        }
      });
    }
  },

  // 加载奖品列表
  async loadPrizes(activityId) {
    try {
      const res = await api.get(`/lottery/activities/${activityId}`, {}, false);
      const prizes = res.prizes || [];
      
      // 计算每个奖品的角度
      const anglePerPrize = 360 / prizes.length;
      const prizesWithAngle = prizes.map((prize, index) => ({
        ...prize,
        startAngle: index * anglePerPrize,
        endAngle: (index + 1) * anglePerPrize
      }));

      this.setData({
        prizes: prizesWithAngle
      });
    } catch (error) {
      console.error('加载奖品列表失败:', error);
    }
  },

  // 加载用户积分
  async loadUserPoints() {
    try {
      const res = await api.get('/points/balance', {}, false);
      this.setData({
        userPoints: res.points || 0
      });
    } catch (error) {
      console.error('加载用户积分失败:', error);
    }
  },

  // 切换活动
  onActivityChange(e) {
    const index = e.detail.value;
    const activity = this.data.activities[index];
    
    this.setData({
      currentActivity: activity
    });

    this.loadPrizes(activity.id);
  },

  // 开始抽奖
  async onStartLottery() {
    const { currentActivity, userPoints, isRotating } = this.data;

    if (isRotating) return;

    if (!currentActivity) {
      wx.showToast({
        title: '暂无抽奖活动',
        icon: 'none'
      });
      return;
    }

    if (userPoints < currentActivity.points_cost) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ isRotating: true });

      // 调用抽奖接口
      const res = await api.post('/lottery/draw', {
        activity_id: currentActivity.id
      }, false);

      // 找到中奖的奖品
      const prizeIndex = this.data.prizes.findIndex(p => p.id === res.prize_id);
      
      if (prizeIndex === -1) {
        throw new Error('奖品不存在');
      }

      // 计算旋转角度（多转几圈 + 目标角度）
      const prize = this.data.prizes[prizeIndex];
      const targetAngle = prize.startAngle + (prize.endAngle - prize.startAngle) / 2;
      const rotateAngle = 360 * 5 + (360 - targetAngle); // 转5圈后停在目标位置

      // 开始旋转动画
      this.setData({
        rotateAngle: this.data.rotateAngle + rotateAngle
      });

      // 动画结束后显示结果
      setTimeout(() => {
        this.setData({
          isRotating: false,
          showResult: true,
          resultPrize: res
        });
        this.loadUserPoints(); // 刷新积分
      }, 3000);

    } catch (error) {
      console.error('抽奖失败:', error);
      this.setData({ isRotating: false });
      wx.showToast({
        title: error.message || '抽奖失败',
        icon: 'none'
      });
    }
  },

  // 关闭结果弹窗
  onCloseResult() {
    this.setData({
      showResult: false,
      resultPrize: null
    });
  },

  // 查看中奖记录
  async onShowRecords() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get('/lottery/records', {
        page: 1,
        limit: 20
      }, false);

      this.setData({
        records: res.records || [],
        showRecords: true
      });

      wx.hideLoading();
    } catch (error) {
      console.error('加载中奖记录失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 关闭记录弹窗
  onCloseRecords() {
    this.setData({
      showRecords: false
    });
  },

  // 查看抽奖规则
  onShowRules() {
    const { currentActivity } = this.data;
    if (!currentActivity) return;

    wx.showModal({
      title: '抽奖规则',
      content: currentActivity.description || '暂无规则说明',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
