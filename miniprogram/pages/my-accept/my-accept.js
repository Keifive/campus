// pages/my-accept/my-accept.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    currentFilter: 'all',
    taskList: [],
    taskStats: {
      total: 0,
      inprogress: 0,
      completed: 0
    }
  },

  onLoad(options) {
    this.loadTaskData()
  },

  onShow() {
    this.loadTaskData()
  },

  // 加载任务数据 - 从orderManager获取所有类型的订单
  loadTaskData() {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userId = userInfo.id || userInfo.studentId;
    
    if (!userId) {
      console.warn('用户未登录');
      this.setData({
        taskStats: { total: 0, inprogress: 0, completed: 0 },
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
    
    // 筛选当前用户接单的订单（accepterId 等于当前用户ID）
    const acceptedTasks = allOrders.filter(o => 
      o.accepterId === userId && (o.status === 'accepted' || o.status === 'completed')
    );
    
    // 计算统计
    const stats = {
      total: acceptedTasks.length,
      inprogress: acceptedTasks.filter(task => task.status === 'accepted').length,
      completed: acceptedTasks.filter(task => task.status === 'completed').length
    }
    
    this.setData({
      taskStats: stats,
      taskList: this.filterTasks(acceptedTasks, this.data.currentFilter)
    })
  },

  // 过滤任务
  filterTasks(tasks, filter) {
    if (filter === 'all') return tasks
    if (filter === 'inprogress') return tasks.filter(task => task.status === 'accepted')
    if (filter === 'completed') return tasks.filter(task => task.status === 'completed')
    return tasks
  },

  // 改变筛选条件
  changeFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.loadTaskData()
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'accepted': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知'
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 去首页接单
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    const task = this.data.taskList.find(t => t.id === taskId)
    
    if (task) {
      wx.showModal({
        title: task.title,
        content: `
类型：${task.type === 'express' ? '快递代取' : task.type === 'buy' ? '商品代买' : '急事代办'}
状态：${this.getStatusText(task.status)}
酬劳：¥${task.reward}
发布时间：${task.createTime}
截止时间：${task.deadline}
取件地址：${task.pickupLocation}
送达地址：${task.deliveryLocation}
发布人：${task.publisher.name}
联系电话：${task.publisher.phone}
${task.description ? `描述：${task.description}` : ''}
        `,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  // 完成任务
  completeTask(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskType = e.currentTarget.dataset.type;
    
    wx.showModal({
      title: '确认完成',
      content: '确认已完成任务吗？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.completeOrder(taskType, taskId)) {
            wx.showToast({ title: '任务已完成', icon: 'success' });
            orderManager.notifyUpdate(taskType);
            this.loadTaskData();
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 取消接单
  cancelAccept(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskType = e.currentTarget.dataset.type;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消接单吗？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.cancelOrder(taskType, taskId)) {
            wx.showToast({ title: '已取消接单', icon: 'success' });
            orderManager.notifyUpdate(taskType);
            this.loadTaskData();
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 订单更新回调
  onOrderUpdate: function(type) {
    this.loadTaskData();
  }
})