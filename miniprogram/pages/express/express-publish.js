// pages/express/express-publish.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    mode: 'create', // 模式：create 或 edit
    orderId: null, // 编辑时的订单ID
    formData: {
      goods: '',
      price: '',
      pickupAddress: '',
      pickupDetail: '',
      deliveryAddress: '',
      deliveryDetail: '',
      contact: '',
      phone: '',
      deadlineDate: '',
      deadlineTime: '',
      description: '',
      urgentLevel: '',
      images: []
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
    const orders = orderManager.getOrders('express');
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
        goods: order.goods || '',
        price: order.price ? order.price.toString() : '',
        pickupAddress: order.pickupAddress || '',
        pickupDetail: order.pickupDetail || '',
        deliveryAddress: order.deliveryAddress || '',
        deliveryDetail: order.deliveryDetail || '',
        contact: order.contact || order.publisher || '',
        phone: order.phone || order.publisherPhone || '',
        deadlineDate: order.deadlineDate || '',
        deadlineTime: order.deadlineTime || '',
        description: order.description || '',
        urgentLevel: order.urgentLevel || '',
        images: order.images || []
      }
    });
  },

  // 输入变化
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 日期选择
  onDateChange: function(e) {
    this.setData({
      'formData.deadlineDate': e.detail.value
    });
  },

  // 时间选择
  onTimeChange: function(e) {
    this.setData({
      'formData.deadlineTime': e.detail.value
    });
  },

  // 设置紧急程度
  setUrgent: function(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      'formData.urgentLevel': level
    });
  },

  // 选择图片
  chooseImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 3 - this.data.formData.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        that.setData({
          'formData.images': [...that.data.formData.images, ...newImages]
        });
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.formData.images;
    images.splice(index, 1);
    this.setData({
      'formData.images': images
    });
  },

  // 表单验证
  validateForm: function() {
    const { goods, price, pickupAddress, deliveryAddress, contact, phone, deadlineDate, deadlineTime } = this.data.formData;
    
    if (!goods.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      wx.showToast({ title: '请输入有效的打赏金额', icon: 'none' });
      return false;
    }
    if (!pickupAddress.trim()) {
      wx.showToast({ title: '请输入取货地址', icon: 'none' });
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

  // 提交订单
  submitOrder: function() {
    if (!this.validateForm()) return;

    wx.showLoading({ title: this.data.mode === 'edit' ? '保存中...' : '发布中...' });

    // 准备订单数据
    const orderData = {
      ...this.data.formData,
      price: parseFloat(this.data.formData.price),
      deadline: `${this.data.formData.deadlineDate} ${this.data.formData.deadlineTime}前有效`,
      deadlineDate: this.data.formData.deadlineDate,
      deadlineTime: this.data.formData.deadlineTime,
      publisher: this.data.formData.contact,
      publisherPhone: this.data.formData.phone,
      isUrgent: this.data.formData.urgentLevel === '特急' || this.data.formData.urgentLevel === '加急',
      urgentLevel: this.data.formData.urgentLevel
    };

    let success = false;
    
    if (this.data.mode === 'edit') {
      // 编辑模式：更新订单
      success = orderManager.updateOrder('express', this.data.orderId, orderData);
    } else {
      // 新建模式：添加订单
      orderData.id = Date.now(); // 使用时间戳作为ID
      orderData.status = 'pending';
      orderData.statusText = '待接单';
      orderData.statusClass = 'pending';
      orderData.createTime = new Date().toLocaleString('zh-CN');
      orderData.accepter = null;
      
      // 获取当前用户信息作为发布者
      const userInfo = wx.getStorageSync('userInfo') || {};
      orderData.publisherId = userInfo.id || userInfo.studentId;
      
      success = orderManager.addOrder('express', orderData);
    }

    if (success) {
      // 通知其他页面更新
      orderManager.notifyUpdate('express');
      
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
