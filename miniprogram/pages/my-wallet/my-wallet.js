// pages/my-wallet/my-wallet.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    balance: {
      total: 158.50,
      available: 128.50,
      frozen: 30.00
    },
    monthStats: {
      income: 245.00,
      expense: 86.50
    },
    recentTransactions: [
      {
        id: 1,
        type: '任务收入',
        time: '2023-10-28 14:30',
        amount: 15.00,
        status: 'success',
        statusText: '已完成'
      },
      {
        id: 2,
        type: '提现申请',
        time: '2023-10-27 09:15',
        amount: -50.00,
        status: 'pending',
        statusText: '处理中'
      },
      {
        id: 3,
        type: '任务支付',
        time: '2023-10-26 18:45',
        amount: -12.00,
        status: 'success',
        statusText: '已完成'
      },
      {
        id: 4,
        type: '邀请奖励',
        time: '2023-10-25 10:20',
        amount: 10.00,
        status: 'success',
        statusText: '已完成'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadWalletData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadWalletData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadWalletData();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载钱包数据
   */
  loadWalletData() {
    // 这里应该调用API获取真实数据
    // 暂时使用模拟数据
    wx.showLoading({
      title: '加载中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      // 模拟API返回数据
      const mockData = {
        balance: {
          total: 158.50,
          available: 128.50,
          frozen: 30.00
        },
        monthStats: {
          income: 245.00,
          expense: 86.50
        }
      };
      
      this.setData(mockData);
    }, 800);
  },

  /**
   * 处理充值
   */
  handleRecharge() {
    wx.showModal({
      title: '充值',
      content: '请选择充值金额',
      confirmText: '去充值',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/recharge/recharge',
          });
        }
      }
    });
  },

  /**
   * 处理提现
   */
  handleWithdraw() {
    if (this.data.balance.available <= 0) {
      wx.showToast({
        title: '无可提现金额',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '提现',
      content: `可用余额：${this.data.balance.available.toFixed(2)}元\n请输入提现金额：`,
      editable: true,
      placeholderText: '请输入金额',
      confirmText: '确认提现',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (amount > this.data.balance.available) {
            wx.showToast({
              title: '金额超出可用余额',
              icon: 'none'
            });
          } else if (amount < 1) {
            wx.showToast({
              title: '提现金额至少1元',
              icon: 'none'
            });
          } else {
            this.submitWithdraw(amount);
          }
        }
      }
    });
  },

  /**
   * 提交提现申请
   */
  submitWithdraw(amount) {
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '提现申请已提交',
        icon: 'success'
      });
      
      // 更新本地数据
      const newAvailable = this.data.balance.available - amount;
      const newFrozen = this.data.balance.frozen + amount;
      
      this.setData({
        'balance.available': newAvailable,
        'balance.frozen': newFrozen,
        'balance.total': newAvailable + newFrozen
      });
    }, 1500);
  },

  /**
   * 跳转到交易记录
   */
  navigateToRecords() {
    wx.navigateTo({
      url: '/pages/transaction-records/transaction-records',
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '校园代取-我的钱包',
      path: '/pages/my-wallet/my-wallet'
    };
  }
});