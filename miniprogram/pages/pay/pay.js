// pages/pay/pay.js
const { request } = require('../../utils/http')

Page({
    /**
     * 页面的初始数据
     */
    data: {
      orderId: '', // 订单ID
      totalFee: 0  // 订单总金额
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 接收从上一个页面传递过来的订单参数
      if (options.orderId && options.totalFee) {
        this.setData({
          orderId: options.orderId,
          totalFee: Number(options.totalFee)
        });
      } else {
        wx.showToast({
          title: '订单参数异常',
          icon: 'none'
        });
        // 若无参数，返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    },
  
    /**
     * 发起支付核心方法
     */
    async handlePay() {
      try {
        // 1. 从本地缓存获取用户openid
        const openid = wx.getStorageSync('openid');
        if (!openid) {
          wx.showToast({
            title: '请先登录小程序',
            icon: 'none'
          });
          // 跳转至登录页
          wx.navigateTo({
            url: '/pages/login/login'
          });
          return;
        }
  
        // 2. 调用后端创建支付订单接口
        const res = await request({
          url: 'https://your.domain.com/api/createPayOrder', 
          method: 'POST',
          data: {
            orderId: this.data.orderId,
            totalAmount: this.data.totalFee,
            openid: openid
          }
        });
  
        // 判断后端接口返回状态
        if (res.data.code !== 0) {
          wx.showToast({
            title: res.data.message || '创建支付失败',
            icon: 'none'
          });
          return;
        }
  
        // 3. 调起微信支付组件
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp.toString(),
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.package,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          // 支付成功回调
          success: (result) => {
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            });
            // 支付成功后跳转至订单详情页
            setTimeout(() => {
              wx.navigateTo({
                url: `/pages/orderDetail/orderDetail?id=${this.data.orderId}`
              });
            }, 1500);
          },
          // 支付失败/取消回调
          fail: (err) => {
            console.error('支付失败：', err);
            wx.showToast({
              title: err.errMsg.includes('cancel') ? '支付已取消' : '支付失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('支付流程异常：', error);
        wx.showToast({
          title: '支付异常，请稍后重试',
          icon: 'none'
        });
      }
    },
  
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
  
    },
  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
  
    },
  
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
  
    },
  
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
  
    },
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
  
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
  });