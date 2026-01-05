// pages/express/express.js
const orderManager = require('../../utils/orderManager.js');
Page({
  data: {
    activeTab: 0,
    searchText: '',
    orders: [],
    filteredOrders: []
  },

  onLoad: function() {
    this.loadOrders();
  },

  onShow: function() {
    this.loadOrders();
  },

  loadOrders: async function() {
    try {
      const orders = await orderManager.load('express');
      this.setData({ orders });
      this.filterOrders();
    } catch (e) {
      console.error('加载订单失败', e);
      // 降级使用本地缓存（如果有）
      const localOrders = orderManager.getOrdersSync('express');
      if (localOrders.length > 0) {
        this.setData({ orders: localOrders });
        this.filterOrders();
      }
      wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
    }
  },

  onOrderUpdate: function(type) {
    if (type === 'express') {
      this.loadOrders();
    }
  },

  // 切换Tab
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index
    });
    this.filterOrders();
  },

  // 根据Tab过滤订单
  filterOrders: function() {
    const { activeTab, orders, searchText } = this.data;
    let filtered = orders;
    
    // 根据状态过滤
    switch(activeTab) {
      case 0: // 待接单
        filtered = orders.filter(o => o.status === 'pending');
        break;
      case 1: // 已接单
        filtered = orders.filter(o => o.status === 'accepted');
        break;
      case 2: // 已完成
        filtered = orders.filter(o => o.status === 'completed');
        break;
      case 3: // 已过期
        filtered = orders.filter(o => o.status === 'expired');
        break;
      case 4: // 全部
        filtered = orders;
        break;
    }

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(o => 
        o.pickupAddress.includes(searchText) || 
        o.deliveryAddress.includes(searchText) ||
        o.pickupDetail.includes(searchText) ||
        o.deliveryDetail.includes(searchText)
      );
    }

    this.setData({ filteredOrders: filtered });
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({ searchText: e.detail.value });
    this.filterOrders();
  },

  // 跳转到我的订单
  goToMyOrders: function() {
    wx.navigateTo({
      url: '/pages/my-accept/my-accept'
    });
  },

  // 跳转到搜索页面
  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search?type=express'
    });
  },

  // 跳转到订单详情
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/express/express-detail?id=' + id
    });
  },

  // 发布订单
  publishOrder: function() {
    wx.navigateTo({
      url: '/pages/express/express-publish'
    });
  }
})