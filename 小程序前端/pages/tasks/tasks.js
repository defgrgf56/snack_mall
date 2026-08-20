// pages/tasks/tasks.js
const api = require('../../utils/request');

Page({
  data: {
    tasks: [], // 任务列表
    summary: {
      total_tasks: 0,
      completed_tasks: 0,
      total_points: 0
    },
    activeTab: 'all', // all, daily, weekly, once
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'daily', name: '每日' },
      { key: 'weekly', name: '每周' },
      { key: 'once', name: '新手' }
    ]
  },

  onLoad() {
    this.loadTasks();
    this.loadSummary();
  },

  onShow() {
    this.loadTasks();
    this.loadSummary();
  },

  // 加载任务列表
  async loadTasks() {
    try {
      const params = {};
      if (this.data.activeTab !== 'all') {
        params.type = this.data.activeTab;
      }

      const res = await api.get('/points-task/list', params, false);
      
      this.setData({
        tasks: res.tasks || []
      });
    } catch (error) {
      console.error('加载任务列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载任务概况
  async loadSummary() {
    try {
      const res = await api.get('/points-task/summary', {}, false);
      
      this.setData({
        summary: res
      });
    } catch (error) {
      console.error('加载任务概况失败:', error);
    }
  },

  // 切换标签
  onTabChange(e) {
    const { key } = e.currentTarget.dataset;
    
    this.setData({
      activeTab: key
    });

    this.loadTasks();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTasks();
    this.loadSummary();
    wx.stopPullDownRefresh();
  },

  // 领取任务奖励
  async onClaimReward(e) {
    const { id } = e.currentTarget.dataset;
    const task = this.data.tasks.find(t => t.id === id);

    if (!task) return;

    // 检查任务是否完成
    if (task.progress < task.target_count) {
      wx.showToast({
        title: '任务未完成',
        icon: 'none'
      });
      return;
    }

    // 检查是否已领取
    if (task.is_claimed) {
      wx.showToast({
        title: '已领取奖励',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '领取中...' });

      const res = await api.post('/points-task/claim', {
        task_id: id
      }, false);

      wx.hideLoading();

      // 显示领取成功
      wx.showModal({
        title: '领取成功',
        content: `恭喜获得 ${res.points} 积分！`,
        showCancel: false,
        success: () => {
          // 刷新列表
          this.loadTasks();
          this.loadSummary();
        }
      });

    } catch (error) {
      console.error('领取奖励失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '领取失败',
        icon: 'none'
      });
    }
  },

  // 跳转到任务相关页面
  onGoToTask(e) {
    const { action, url } = e.currentTarget.dataset;
    
    if (!url) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      return;
    }

    if (action === 'navigate') {
      wx.navigateTo({ url });
    } else if (action === 'switchTab') {
      wx.switchTab({ url });
    }
  },

  // 查看任务详情
  onTaskDetail(e) {
    const { task } = e.currentTarget.dataset;
    
    wx.showModal({
      title: task.name,
      content: `${task.description}\n\n目标：${task.target_count}次\n奖励：${task.points}积分`,
      showCancel: false
    });
  }
});
