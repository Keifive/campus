// pages/my-completed.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    currentType: 'all',
    taskList: [],
    taskStats: {
      total: 0,
      published: 0,
      accepted: 0
    },
    totalEarnings: 0
  },

  onLoad(options) {
    this.loadTaskData()
  },

  onShow() {
    this.loadTaskData()
  },

  // 加载任务数据
  loadTaskData() {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userId = userInfo.id || userInfo.studentId;
    
    if (!userId) {
      console.warn('用户未登录');
      this.setData({
        taskStats: { total: 0, published: 0, accepted: 0 },
        totalEarnings: 0,
        taskList: []
      });
      return;
    }
    
    const expressOrders = orderManager.getOrders('express') || [];
    const buyOrders = orderManager.getOrders('buy') || [];
    const urgentOrders = orderManager.getOrders('urgent') || [];
    const rentOrders = orderManager.getOrders('rent') || [];
    const companyOrders = orderManager.getOrders('company') || [];
    
    // 合并所有订单并添加类型标识
    const allOrders = [
      ...expressOrders.map(o => ({...o, type: 'express'})),
      ...buyOrders.map(o => ({...o, type: 'buy'})),
      ...urgentOrders.map(o => ({...o, type: 'urgent'})),
      ...rentOrders.map(o => ({...o, type: 'rent'})),
      ...companyOrders.map(o => ({...o, type: 'company'}))
    ];
    
    // 筛选已完成的订单（与当前用户相关）
    const completedTasks = allOrders.filter(o => 
      o.status === 'completed' && (o.publisherId === userId || o.accepterId === userId)
    );
    
    // 计算统计
    const stats = {
      total: completedTasks.length,
      published: completedTasks.filter(task => task.publisherId === userId).length,
      accepted: completedTasks.filter(task => task.accepterId === userId).length
    };
    
    // 计算总收入（只计算接单者为当前用户的订单）
    const totalEarnings = completedTasks
      .filter(task => task.accepterId === userId)
      .reduce((sum, task) => sum + (task.price || task.reward || 0), 0);
    
    this.setData({
      taskStats: stats,
      totalEarnings: totalEarnings,
      taskList: this.filterTasks(completedTasks, this.data.currentType, userId)
    });
  },

  // 过滤任务
  filterTasks(tasks, type, userId) {
    if (type === 'all') return tasks;
    if (type === 'published') return tasks.filter(task => task.publisherId === userId);
    if (type === 'accepted') return tasks.filter(task => task.accepterId === userId);
    return tasks;
  },

  // 切换类型
  changeType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentType: type });
    this.loadTaskData();
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(t => t.id === taskId);
    
    if (task) {
      wx.showModal({
        title: task.title || task.goods || '任务详情',
        content: `类型：${task.type === 'express' ? '快递' : task.type === 'buy' ? '代买' : task.type === 'urgent' ? '急事' : task.type === 'rent' ? '租借' : '陪替'}
状态：已完成
酬劳：¥${task.price || task.reward}
完成时间：${task.completeTime || '未知'}
${task.publisher ? `发布人：${task.publisher}` : ''}
${task.accepter ? `接单人：${task.accepter}` : ''}`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 去首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 去发布页面
  goToPublish() {
    wx.navigateTo({
      url: '/pages/ques/ques'
    });
  }
});