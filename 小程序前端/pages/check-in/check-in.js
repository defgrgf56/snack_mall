// pages/check-in/check-in.js
const api = require('../../utils/request');

Page({
  data: {
    hasCheckedIn: false, // 今天是否已签到
    continuousDays: 0, // 连续签到天数
    totalPoints: 0, // 累计获得积分
    todayPoints: 0, // 今天可获得积分
    checkInRecords: [], // 签到记录（用于日历显示）
    currentMonth: '', // 当前月份
    calendar: [], // 日历数据
    rewardRules: [
      { day: 1, points: 5 },
      { day: 2, points: 10 },
      { day: 3, points: 15 },
      { day: 4, points: 20 },
      { day: 5, points: 25 },
      { day: 6, points: 30 },
      { day: 7, points: 50 }
    ],
    showSuccess: false // 显示签到成功动画
  },

  onLoad() {
    this.loadCheckInStatus();
    this.loadCheckInCalendar();
  },

  onShow() {
    this.loadCheckInStatus();
  },

  // 加载签到状态
  async loadCheckInStatus() {
    try {
      const res = await api.get('/check-in/status', {}, false);
      
      // 计算今天应得积分（基于连续签到天数）
      const nextDay = (res.continuous_days % 7) + 1;
      const todayPoints = this.data.rewardRules.find(r => r.day === nextDay)?.points || 5;

      this.setData({
        hasCheckedIn: res.has_checked_in,
        continuousDays: res.continuous_days || 0,
        totalPoints: res.total_points || 0,
        todayPoints
      });
    } catch (error) {
      console.error('加载签到状态失败:', error);
    }
  },

  // 加载签到日历
  async loadCheckInCalendar() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const res = await api.get('/check-in/calendar', {
        year,
        month
      }, false);

      this.setData({
        checkInRecords: res.records || [],
        currentMonth: `${year}年${month}月`
      });

      this.generateCalendar(year, month);
    } catch (error) {
      console.error('加载签到日历失败:', error);
    }
  },

  // 生成日历数据
  generateCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay(); // 本月第一天是星期几
    const daysInMonth = new Date(year, month, 0).getDate(); // 本月有多少天
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const calendar = [];
    let week = [];

    // 填充第一周的空白
    for (let i = 0; i < firstDay; i++) {
      week.push({ day: '', isEmpty: true });
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = (year === currentYear && month === currentMonth && day === today);
      const hasCheckedIn = this.data.checkInRecords.some(record => {
        const recordDate = new Date(record.check_date);
        return recordDate.getDate() === day;
      });

      week.push({
        day,
        isEmpty: false,
        isToday,
        hasCheckedIn
      });

      // 每周7天，换行
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // 填充最后一周的空白
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: '', isEmpty: true });
      }
      calendar.push(week);
    }

    this.setData({ calendar });
  },

  // 执行签到
  async onCheckIn() {
    if (this.data.hasCheckedIn) {
      wx.showToast({
        title: '今天已签到',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '签到中...' });

      const res = await api.post('/check-in', {}, false);

      wx.hideLoading();

      // 显示签到成功动画
      this.setData({
        showSuccess: true,
        hasCheckedIn: true,
        continuousDays: res.continuous_days,
        totalPoints: this.data.totalPoints + res.points
      });

      // 2秒后关闭动画
      setTimeout(() => {
        this.setData({ showSuccess: false });
      }, 2000);

      // 刷新日历
      this.loadCheckInCalendar();

    } catch (error) {
      console.error('签到失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '签到失败',
        icon: 'none'
      });
    }
  },

  // 查看签到规则
  onShowRules() {
    let content = '连续签到奖励规则：\n';
    this.data.rewardRules.forEach(rule => {
      content += `第${rule.day}天: ${rule.points}积分\n`;
    });
    content += '\n连续签到7天后，重新从第1天开始循环。';

    wx.showModal({
      title: '签到规则',
      content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 查看签到记录
  onShowRecords() {
    if (this.data.checkInRecords.length === 0) {
      wx.showToast({
        title: '暂无签到记录',
        icon: 'none'
      });
      return;
    }

    let content = '本月签到记录：\n';
    this.data.checkInRecords.slice(0, 10).forEach(record => {
      const date = new Date(record.check_date);
      content += `${date.getMonth() + 1}月${date.getDate()}日: +${record.points}积分\n`;
    });

    wx.showModal({
      title: '签到记录',
      content,
      showCancel: false
    });
  }
});
