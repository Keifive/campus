// pages/company/company-publish.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    mode: 'create', // 模式：create 或 edit
    orderId: null, // 编辑时的订单ID
    formData: {
      title: '',
      price: '',
      contact: '',
      phone: '',
      deadlineDate: '',
      deadlineTime: '',
      description: '',
      urgentLevel: ''
    }
  },

  onLoad: function(options) {
    // 检查是否为编辑模式
    if (options.mode === 'edit' && options.id) {
      this.setData({
        mode: 'edit',
        orderId: options.id
      });
      this.loadOrderData(options.id);
    } else {
      // 新建模式，设置默认截止日期为明天
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      this.setData({
        'formData.deadlineDate': dateStr,
        'formData.deadlineTime': '18:00'
      });
    }
  },

  // 加载订单数据（编辑模式）
  loadOrderData: function(orderId) {
    const orders = orderManager.getOrders('company');
    const order = orders.find(o => o.id == orderId);
    
    if (!order) {
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 填充表单数据
    this.setData({
      formData: {
        title: order.title || '',
        price: order.price ? order.price.toString() : '',
        contact: order.contact || order.publisher || '',
        phone: order.phone || order.publisherPhone || '',
        deadlineDate: order.deadlineDate || '',
        deadlineTime: order.deadlineTime || '',
        description: order.description || '',
        urgentLevel: order.urgentLevel || ''
      }
    });
  },

  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  onDateChange: function(e) {
    this.setData({
      'formData.deadlineDate': e.detail.value
    });
  },

  onTimeChange: function(e) {
    this.setData({
      'formData.deadlineTime': e.detail.value
    });
  },

  setUrgent: function(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      'formData.urgentLevel': level
    });
  },

  validateForm: function() {
    const { title, price, contact, phone, deadlineDate, deadlineTime, description } = this.data.formData;
    
    if (!title.trim()) {
      wx.showToast({ title: '请输入需求标题', icon: 'none' });
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      wx.showToast({ title: '请输入有效的打赏金额', icon: 'none' });
      return false;
    }
    if (!contact.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' });
      return false;
    }
    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入有效的手机号', icon: 'none' });
      return false;
    }
    if (!deadlineDate || !deadlineTime) {
      wx.showToast({ title: '请选择截止时间', icon: 'none' });
      return false;
    }
    if (!description.trim()) {
      wx.showToast({ title: '请输入详细描述', icon: 'none' });
      return false;
    }
    return true;
  },

  submitOrder: function() {
    if (!this.validateForm()) return;

    wx.showLoading({ title: this.data.mode === 'edit' ? '保存中...' : '发布中...' });

    const formData = this.data.formData;
    const orderData = {
      title: formData.title,
      price: parseFloat(formData.price),
      deadline: formData.deadlineDate + ' ' + formData.deadlineTime + '前有效',
      deadlineDate: formData.deadlineDate,
      deadlineTime: formData.deadlineTime,
      description: formData.description,
      isUrgent: formData.urgentLevel !== '',
      urgentLevel: formData.urgentLevel,
      contact: formData.contact,
      phone: formData.phone
    };

    let success = false;
    
    if (this.data.mode === 'edit') {
      // 编辑模式：更新订单
      success = orderManager.updateOrder('company', this.data.orderId, orderData);
    } else {
      // 新建模式：添加订单
      // 获取当前用户信息作为发布者
      const userInfo = wx.getStorageSync('userInfo') || {};
      orderData.publisherId = userInfo.id || userInfo.studentId;
      
      const newOrder = orderManager.addOrder('company', orderData);
      success = !!newOrder;
    }

    if (success) {
      orderManager.notifyUpdate('company');
      
      wx.hideLoading();
      wx.showToast({
        title: this.data.mode === 'edit' ? '保存成功' : '发布成功',
        icon: 'success',
        duration: 1500
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.hideLoading();
      wx.showToast({
        title: this.data.mode === 'edit' ? '保存失败' : '发布失败',
        icon: 'none'
      });
    }
  }
});
