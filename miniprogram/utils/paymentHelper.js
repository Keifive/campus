// utils/paymentHelper.js
// 支付工具函数

/**
 * 跳转到支付页面
 * @param {Object} options - 支付参数
 * @param {String} options.orderId - 订单ID
 * @param {Number} options.amount - 支付金额
 * @param {String} options.title - 订单标题
 */
function goToPayment(options) {
  const { orderId, amount, title = '订单支付' } = options;
  
  if (!orderId) {
    wx.showToast({
      title: '订单信息错误',
      icon: 'none'
    });
    return;
  }
  
  if (!amount || amount <= 0) {
    wx.showToast({
      title: '支付金额错误',
      icon: 'none'
    });
    return;
  }
  
  wx.navigateTo({
    url: `/pages/payment/payment?orderId=${orderId}&amount=${amount}&title=${encodeURIComponent(title)}`
  });
}

/**
 * 获取支付记录
 * @returns {Array} 支付记录列表
 */
function getPaymentRecords() {
  return wx.getStorageSync('paymentRecords') || [];
}

/**
 * 根据订单ID查询支付记录
 * @param {String} orderId - 订单ID
 * @returns {Object|null} 支付记录
 */
function getPaymentByOrderId(orderId) {
  const records = getPaymentRecords();
  return records.find(record => record.orderId === orderId) || null;
}

module.exports = {
  goToPayment,
  getPaymentRecords,
  getPaymentByOrderId
};
