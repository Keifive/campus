// pages/rent/rent.js
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

  loadOrders: function() {
    const orders = orderManager.getOrders('rent') || [];
    this.setData({ orders });
    this.filterOrders();
  },

  onOrderUpdate: function(type) {
    if (type === 'rent') {
      this.loadOrders();
    }
  },

  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
    this.filterOrders();
  },

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
        (o.title && o.title.includes(searchText)) || 
        (o.description && o.description.includes(searchText))
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
      url: '/pages/search/search?type=rent'
    });
  },

  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/rent/rent-detail?id=' + id
    });
  },

  publishOrder: function() {
    wx.navigateTo({
      url: '/pages/rent/rent-publish'
    });
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})