// pages/my-favorites/my-favorites.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    favoriteList: []
  },

  onLoad(options) {
    this.loadFavoriteData()
  },

  onShow() {
    this.loadFavoriteData()
  },

  // 加载收藏数据
  loadFavoriteData() {
    // 先从本地存储获取收藏的任务ID列表
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    
    if (favoriteIds.length === 0) {
      // 如果没有收藏记录，初始化一些待接单订单作为收藏
      this.initFavoriteData();
    } else {
      // 从 orderManager 获取所有订单
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
      
      // 筛选出被收藏的任务
      const favoriteTasks = allOrders.filter(o => favoriteIds.includes(o.id));
      
      this.setData({
        favoriteList: favoriteTasks
      });
    }
  },

  // 初始化收藏数据
  initFavoriteData() {
    // 从 orderManager 获取所有订单
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
    
    // 选择前5个待接单订单作为初始收藏
    const initialFavorites = allOrders.filter(o => o.status === 'pending').slice(0, 5);
    const favoriteIds = initialFavorites.map(o => o.id);
    
    // 保存收藏ID到本地存储
    wx.setStorageSync('favoriteIds', favoriteIds);
    
    this.setData({
      favoriteList: initialFavorites
    });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待接单',
      'accepted': '已接单',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知'
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 去首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    const task = this.data.favoriteList.find(t => t.id === taskId)
    
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
${task.publisher ? `发布人：${task.publisher.name}\n信用分：${task.publisher.creditScore || 100}` : ''}
${task.description ? `描述：${task.description}` : ''}
        `,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  // 接单
  acceptTask(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskType = e.currentTarget.dataset.type;
    
    wx.showModal({
      title: '确认接单',
      content: '确定要接取这个任务吗？接单后需要在规定时间内完成',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.acceptOrder(taskType, taskId, '当前用户')) {
            wx.showToast({ title: '接单成功', icon: 'success' });
            orderManager.notifyUpdate(taskType);
            this.loadFavoriteData();
          } else {
            wx.showToast({ title: '接单失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 取消收藏
  removeFavorite(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          // 从收藏列表中移除
          const newFavoriteList = this.data.favoriteList.filter(task => task.id !== taskId);
          this.setData({ favoriteList: newFavoriteList });
          
          // 更新本地存储的收藏ID列表
          const favoriteIds = wx.getStorageSync('favoriteIds') || [];
          const newFavoriteIds = favoriteIds.filter(id => id !== taskId);
          wx.setStorageSync('favoriteIds', newFavoriteIds);
          
          // 通知其他页面更新数据
          const pages = getCurrentPages();
          pages.forEach(page => {
            if (page.route === 'pages/profile/profile') {
              page.loadUserData();
            }
          });
          
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  }
})