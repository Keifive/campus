// pages/urgent/urgent-detail.js
const orderManager = require('../../utils/orderManager.js');
Page({
  data: {
    orderId: null,
    isFavorite: false,
    orderDetail: {},
    orderType: 'urgent'
  },

  onLoad: function(options) {
    const id = parseInt(options.id);
    this.setData({ orderId: id });
    this.loadOrderDetail(id);
    this.checkIfFavorite(id);
  },

  loadOrderDetail: function(id) {
    const orders = orderManager.getOrders('urgent');
    const order = orders.find(o => o.id === id);
    if (order) {
      // 获取当前用户信息
      const userInfo = wx.getStorageSync('userInfo') || {};
      const currentUserId = userInfo.id || userInfo.studentId;
      
      // 判断是否为发布者或接单者
      const isPublisher = currentUserId && order.publisherId && currentUserId === order.publisherId;
      const isAccepter = currentUserId && order.accepterId && currentUserId === order.accepterId;
      const canViewPrivacy = isPublisher || isAccepter;
      
      // 处理隐私信息
      const displayOrder = {
        ...order,
        publisherPhone: canViewPrivacy ? order.publisherPhone : '**********',
        accepterPhone: canViewPrivacy ? order.accepterPhone : '**********'
      };
      
      this.setData({ 
        orderDetail: displayOrder,
        orderType: 'urgent',
        canViewPrivacy: canViewPrivacy
      });
    }
  },

  onShow: function() {
    if (this.data.orderId) {
      this.loadOrderDetail(this.data.orderId);
      this.checkIfFavorite(this.data.orderId);
    }
  },

  // 检查是否已收藏
  checkIfFavorite: function(orderId) {
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    const isFavorite = favoriteIds.includes(orderId);
    this.setData({ isFavorite });
  },

  // 收藏订单
  toggleFavorite: function() {
    const orderId = this.data.orderId;
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    const isFavorite = favoriteIds.includes(orderId);
    
    if (isFavorite) {
      // 取消收藏
      const newFavoriteIds = favoriteIds.filter(id => id !== orderId);
      wx.setStorageSync('favoriteIds', newFavoriteIds);
      this.setData({ isFavorite: false });
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 添加收藏
      favoriteIds.push(orderId);
      wx.setStorageSync('favoriteIds', favoriteIds);
      this.setData({ isFavorite: true });
      wx.showToast({
        title: '已收藏',
        icon: 'success'
      });
    }
    
    // 通知个人中心页面更新数据
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.route === 'pages/profile/profile') {
        page.loadUserData && page.loadUserData();
      }
    });
  },

  // 分享订单
  onShareAppMessage: function() {
    return {
      title: '代办急事 - ' + this.data.orderDetail.price + '元',
      path: '/pages/urgent/urgent-detail?id=' + this.data.orderId
    };
  },

  // 返回首页
  goHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 接单
  acceptOrder: function() {
    const order = this.data.orderDetail;
    if (order.status !== 'pending') {
      wx.showToast({ title: '订单已被接单', icon: 'none' });
      return;
    }

    // 检查是否为自己的订单
    const userInfo = wx.getStorageSync('userInfo') || {};
    const currentUserId = userInfo.id || userInfo.studentId;
    
    if (currentUserId && order.publisherId && currentUserId === order.publisherId) {
      wx.showModal({
        title: '提示',
        content: '不能接取自己发布的订单',
        showCancel: false
      });
      return;
    }

    wx.showModal({
      title: '确认接单',
      content: '确定要接取这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟接单者信息
          const accepterInfo = {
            name: '当前用户',
            phone: '13800138888'
          };
          
          if (orderManager.acceptOrder('urgent', order.id, accepterInfo)) {
            wx.showToast({ title: '接单成功', icon: 'success' });
            this.loadOrderDetail(order.id);
            
            // 通知所有页面更新
            orderManager.notifyUpdate('urgent');
            
            // 通知列表页更新
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({ title: '接单失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 取消接单
  cancelOrder: function() {
    const order = this.data.orderDetail;
    if (order.status !== 'accepted') {
      wx.showToast({ title: '订单状态异常', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消',
      content: '确定要取消接单吗？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.cancelOrder('urgent', order.id)) {
            wx.showToast({ title: '已取消接单', icon: 'success' });
            this.loadOrderDetail(order.id);
            orderManager.notifyUpdate('urgent');
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 去支付
  goToPayment: function() {
    const order = this.data.orderDetail;
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${order.id}&amount=${order.price}&title=${encodeURIComponent(order.title || '代办急事')}`
    });
  },

  // 完成订单
  completeOrder: function() {
    const order = this.data.orderDetail;
    if (order.status !== 'accepted') {
      wx.showToast({ title: '订单状态异常', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认完成',
      content: '确定要完成该订单吗？',
      success: (res) => {
        if (res.confirm) {
          if (orderManager.completeOrder('urgent', order.id)) {
            wx.showToast({ title: '订单已完成', icon: 'success' });
            this.loadOrderDetail(order.id);
            orderManager.notifyUpdate('urgent');
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 联系发布者
  contactPublisher: function() {
    // 检查是否有权限查看隐私信息
    if (!this.data.canViewPrivacy) {
      wx.showModal({
        title: '提示',
        content: '只有发布者或接单者可以查看联系方式',
        showCancel: false
      });
      return;
    }
    
    const order = this.data.orderDetail;
    wx.makePhoneCall({
      phoneNumber: order.publisherPhone || '13800138000',
      fail: () => {
        wx.showToast({ title: '拨打失败', icon: 'none' });
      }
    });
  },

  // 联系接单者
  contactAccepter: function() {
    // 检查是否有权限查看隐私信息
    if (!this.data.canViewPrivacy) {
      wx.showModal({
        title: '提示',
        content: '只有发布者或接单者可以查看联系方式',
        showCancel: false
      });
      return;
    }
    
    const order = this.data.orderDetail;
    if (!order.accepterPhone) {
      wx.showToast({ title: '暂无接单者', icon: 'none' });
      return;
    }
    wx.makePhoneCall({
      phoneNumber: order.accepterPhone,
      fail: () => {
        wx.showToast({ title: '拨打失败', icon: 'none' });
      }
    });
  }
});
