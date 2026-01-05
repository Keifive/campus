// pages/search/search.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    searchKeyword: '',
    searchResults: [],
    searchHistory: [],
    hasSearched: false,
    orderType: '' // 从哪个页面进入的搜索
  },

  onLoad(options) {
    // 获取订单类型参数
    if (options.type) {
      this.setData({
        orderType: options.type
      });
    }
    
    // 加载历史搜索记录
    this.loadSearchHistory();
  },

  // 加载历史搜索记录
  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory: history
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    // 保存搜索历史
    this.saveSearchHistory(keyword);

    // 执行搜索
    this.performSearch(keyword);
  },

  // 执行搜索逻辑
  performSearch(keyword) {
    // 获取所有订单
    const expressOrders = orderManager.getOrders('express') || [];
    const buyOrders = orderManager.getOrders('buy') || [];
    const urgentOrders = orderManager.getOrders('urgent') || [];
    const rentOrders = orderManager.getOrders('rent') || [];
    const companyOrders = orderManager.getOrders('company') || [];

    // 合并所有订单并添加类型标识和类型文本
    let allOrders = [
      ...expressOrders.map(o => ({...o, type: 'express', typeText: '快递代取'})),
      ...buyOrders.map(o => ({...o, type: 'buy', typeText: '代买服务'})),
      ...urgentOrders.map(o => ({...o, type: 'urgent', typeText: '急事代办'})),
      ...rentOrders.map(o => ({...o, type: 'rent', typeText: '租借服务'})),
      ...companyOrders.map(o => ({...o, type: 'company', typeText: '陪同服务'}))
    ];

    // 如果指定了订单类型，则只搜索该类型
    if (this.data.orderType) {
      allOrders = allOrders.filter(o => o.type === this.data.orderType);
    }

    // 搜索匹配关键词的订单
    const results = allOrders.filter(order => {
      const searchText = keyword.toLowerCase();
      
      // 搜索订单标题
      if (order.title && order.title.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // 搜索商品名称
      if (order.goods && order.goods.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // 搜索地址
      if (order.pickupAddress && order.pickupAddress.toLowerCase().includes(searchText)) {
        return true;
      }
      if (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchText)) {
        return true;
      }
      
      // 搜索描述
      if (order.description && order.description.toLowerCase().includes(searchText)) {
        return true;
      }
      
      return false;
    });

    // 按时间排序（最新的在前）
    results.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    this.setData({
      searchResults: results,
      hasSearched: true
    });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    
    // 移除重复的关键词
    history = history.filter(item => item !== keyword);
    
    // 添加到数组开头
    history.unshift(keyword);
    
    // 只保留最近10条记录
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    wx.setStorageSync('searchHistory', history);
    this.setData({
      searchHistory: history
    });
  },

  // 从历史记录搜索
  searchFromHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      searchKeyword: keyword
    });
    this.performSearch(keyword);
  },

  // 删除单条历史记录
  deleteHistoryItem(e) {
    const index = e.currentTarget.dataset.index;
    let history = this.data.searchHistory;
    history.splice(index, 1);
    
    wx.setStorageSync('searchHistory', history);
    this.setData({
      searchHistory: history
    });
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史搜索记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({
            searchHistory: []
          });
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空搜索输入
  clearSearch() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      hasSearched: false
    });
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    const orderType = e.currentTarget.dataset.type;
    
    let url = '';
    switch(orderType) {
      case 'express':
        url = `/pages/express/express-detail?id=${orderId}`;
        break;
      case 'buy':
        url = `/pages/buy-it/buy-detail?id=${orderId}`;
        break;
      case 'urgent':
        url = `/pages/urgent/urgent-detail?id=${orderId}`;
        break;
      case 'rent':
        url = `/pages/rent/rent-detail?id=${orderId}`;
        break;
      case 'company':
        url = `/pages/company/company-detail?id=${orderId}`;
        break;
    }
    
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
