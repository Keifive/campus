// pages/payment/payment.js
Page({
  data: {
    orderInfo: {
      id: '',
      title: '',
      amount: 0
    },
    selectedMethod: 'wechat', // 默认微信支付
    showResult: false,
    paymentSuccess: false,
    resultMessage: ''
  },

  onLoad(options) {
    // 从上一页获取订单信息
    if (options.orderId && options.amount && options.title) {
      this.setData({
        orderInfo: {
          id: options.orderId,
          title: decodeURIComponent(options.title),
          amount: parseFloat(options.amount)
        }
      });
    } else {
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 选择支付方式
  selectMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      selectedMethod: method
    });
  },

  // 确认支付
  confirmPayment() {
    if (!this.data.selectedMethod) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '支付中...'
    });

    // 模拟支付过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟支付结果（90%成功率）
      const success = Math.random() > 0.1;
      
      if (success) {
        this.handlePaymentSuccess();
      } else {
        this.handlePaymentFail();
      }
    }, 2000);
  },

  // 支付成功处理
  handlePaymentSuccess() {
    const methodName = this.data.selectedMethod === 'wechat' ? '微信支付' : '支付宝支付';
    
    // 记录支付记录
    this.savePaymentRecord({
      orderId: this.data.orderInfo.id,
      amount: this.data.orderInfo.amount,
      method: this.data.selectedMethod,
      methodName: methodName,
      status: 'success',
      time: new Date().toLocaleString('zh-CN')
    });

    this.setData({
      showResult: true,
      paymentSuccess: true,
      resultMessage: `已通过${methodName}成功支付¥${this.data.orderInfo.amount}`
    });
  },

  // 支付失败处理
  handlePaymentFail() {
    const methodName = this.data.selectedMethod === 'wechat' ? '微信支付' : '支付宝支付';
    
    this.setData({
      showResult: true,
      paymentSuccess: false,
      resultMessage: `${methodName}支付失败，请重试`
    });
  },

  // 保存支付记录
  savePaymentRecord(record) {
    let paymentRecords = wx.getStorageSync('paymentRecords') || [];
    paymentRecords.unshift(record);
    wx.setStorageSync('paymentRecords', paymentRecords);
  },

  // 关闭结果弹窗
  closeResult() {
    if (this.data.paymentSuccess) {
      // 支付成功，返回上一页并刷新
      wx.navigateBack({
        success: () => {
          // 触发上一页刷新
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          if (prevPage && prevPage.onShow) {
            prevPage.onShow();
          }
        }
      });
    } else {
      // 支付失败，关闭弹窗允许重试
      this.setData({
        showResult: false
      });
    }
  }
});
