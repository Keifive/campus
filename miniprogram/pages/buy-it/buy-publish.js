// pages/buy-it/buy-publish.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    formData: {
      goods: '',
      price: '',
      deliveryAddress: '',
      deliveryDetail: '',
      contact: '',
      phone: '',
      deadlineDate: '',
      deadlineTime: '',
      description: '',
      urgentLevel: ''
    }
  },

  onLoad: function() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    this.setData({
      'formData.deadlineDate': dateStr,
      'formData.deadlineTime': '18:00'
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
    const { goods, price, deliveryAddress, contact, phone, deadlineDate, deadlineTime } = this.data.formData;
    
    if (!goods.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      wx.showToast({ title: '请输入有效的打赏金额', icon: 'none' });
      return false;
    }
    if (!deliveryAddress.trim()) {
      wx.showToast({ title: '请输入送货地址', icon: 'none' });
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
    return true;
  },

  submitOrder: function() {
    if (!this.validateForm()) return;

    wx.showLoading({ title: '发布中...' });

    const formData = this.data.formData;
    const orderData = {
      title: formData.goods,
      goods: formData.goods,
      price: parseFloat(formData.price),
      deadline: formData.deadlineDate + ' ' + formData.deadlineTime + '前有效',
      deliveryAddress: formData.deliveryAddress,
      deliveryDetail: formData.deliveryDetail,
      description: formData.description,
      isUrgent: formData.urgentLevel !== '',
      urgentLevel: formData.urgentLevel,
      contact: formData.contact,
      phone: formData.phone
    };

    setTimeout(() => {
      orderManager.addOrder('buy', orderData);
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500
      });
      
      orderManager.notifyUpdate('buy');
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  }
});
