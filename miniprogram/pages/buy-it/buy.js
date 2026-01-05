// pages/buy-it/buy.js
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
    const orders = await orderManager.load('buy');
    this.setData({ orders });
    const filtered = orders.filter(o => o.status === 'pending');
    this.setData({ filteredOrders: filtered });
  },

  onOrderUpdate: function(type) {
    if (type === 'buy') {
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
    
    switch(activeTab) {
      case 0:
        filtered = orders.filter(o => o.status === 'pending');
        break;
      case 1:
        filtered = orders.filter(o => o.status === 'accepted');
        break;
      case 2:
        filtered = orders.filter(o => o.status === 'completed');
        break;
      case 3:
        filtered = orders.filter(o => o.status === 'expired');
        break;
      case 4:
        filtered = orders;
        break;
    }

    if (searchText) {
      filtered = filtered.filter(o => 
        o.title.includes(searchText) || 
        o.description.includes(searchText)
      );
    }

    this.setData({ filteredOrders: filtered });
  },

  onSearchInput: function(e) {
    this.setData({ searchText: e.detail.value });
    this.filterOrders();
  },

  goToMyOrders: function() {
    wx.navigateTo({
      url: '/pages/my-accept/my-accept'
    });
  },

  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search?type=buy'
    });
  },

  goToMypublishOrder: function() {
    wx.navigateTo({
      url: '/pages/buy-it/buy-publish'
    });
  },

  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/buy-it/buy-detail?id=' + id
    });
  },

  publishOrder: function() {
    wx.navigateTo({
      url: '/pages/buy-it/buy-publish'
    });
  }
})