// pages/rent/rent-detail.js
const orderManager = require('../../utils/orderManager.js');
const paymentHelper = require('../../utils/paymentHelper.js');

Page({
  data: {
    orderId: null,
    isFavorite: false,
    orderDetail: {},
    orderType: 'rent',
    canViewPrivacy: false
  },

  onLoad(options) {
    const id = parseInt(options.id);
    this.setData({ orderId: id });
    this.loadOrderDetail(id);
    this.checkIfFavorite(id);
  },

  loadOrderDetail(id) {
    const orders = orderManager.getOrders('rent');
    const order = orders.find(o => o.id === id);
    if (order) {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const currentUserId = userInfo.id || userInfo.studentId;
      const isPublisher = currentUserId && order.publisherId && currentUserId === order.publisherId;
      const isAccepter = currentUserId && order.accepterId && currentUserId === order.accepterId;
      const canViewPrivacy = isPublisher || isAccepter;
      
      const displayOrder = {
        ...order,
        publisherPhone: canViewPrivacy ? (order.phone || order.publisherPhone) : '**********',
        accepterPhone: canViewPrivacy ? order.accepterPhone : '**********'
      };
      
      this.setData({ orderDetail: displayOrder, canViewPrivacy });
    }
  },

  onShow() {
    if (this.data.orderId) {
      this.loadOrderDetail(this.data.orderId);
      this.checkIfFavorite(this.data.orderId);
    }
  },

  checkIfFavorite(orderId) {
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    this.setData({ isFavorite: favoriteIds.includes(orderId) });
  },

  toggleFavorite() {
    const orderId = this.data.orderId;
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    const isFavorite = favoriteIds.includes(orderId);
    
    if (isFavorite) {
      wx.setStorageSync('favoriteIds', favoriteIds.filter(id => id !== orderId));
      this.setData({ isFavorite: false });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      favoriteIds.push(orderId);
      wx.setStorageSync('favoriteIds', favoriteIds);
      this.setData({ isFavorite: true });
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
  },

  onShareAppMessage() {
    return {
      title: '租借服务 - ' + this.data.orderDetail.title,
      path: '/pages/rent/rent-detail?id=' + this.data.orderId
    };
  },

  acceptOrder() {
    const order = this.data.orderDetail;
    if (order.status !== 'pending') {
      wx.showToast({ title: '订单已被接单', icon: 'none' });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo') || {};
    const currentUserId = userInfo.id || userInfo.studentId;
    
    if (currentUserId && order.publisherId && currentUserId === order.publisherId) {
      wx.showModal({ title: '提示', content: '不能接取自己发布的订单', showCancel: false });
      return;
    }

    wx.showModal({
      title: '确认接单',
      content: '确定要接取这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          const accepterInfo = {
            name: userInfo.name || userInfo.nickName || '匿名用户',
            phone: userInfo.phone || '未提供'
          };
          
          if (orderManager.acceptOrder('rent', order.id, accepterInfo)) {
            orderManager.notifyUpdate('rent');
            this.loadOrderDetail(order.id);
            wx.showToast({ title: '接单成功', icon: 'success' });
          }
        }
      }
    });
  },

  cancelAccept() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消接单吗？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.cancelOrder('rent', this.data.orderId)) {
            orderManager.notifyUpdate('rent');
            this.loadOrderDetail(this.data.orderId);
            wx.showToast({ title: '已取消接单', icon: 'success' });
          }
        }
      }
    });
  },

  completeOrder() {
    wx.showModal({
      title: '确认完成',
      content: '确认订单已完成？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.completeOrder('rent', this.data.orderId)) {
            orderManager.notifyUpdate('rent');
            this.loadOrderDetail(this.data.orderId);
            wx.showToast({ title: '订单已完成', icon: 'success' });
          }
        }
      }
    });
  },

  goToPay() {
    paymentHelper.navigateToPayment({
      orderId: this.data.orderId,
      orderType: 'rent',
      amount: this.data.orderDetail.price,
      title: this.data.orderDetail.title
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
