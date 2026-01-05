// pages/account-security/account-security.js
Page({
  data: {},

  // 跳转到修改密码
  navToChangePwd() {
    wx.navigateTo({
      url: '/pages/account-security/change-pwd'
    });
  },

  // 跳转到设备管理
  navToDeviceManage() {
    wx.navigateTo({
      url: '/pages/account-security/device-manage'
    });
  },


  // 跳转到登录记录
  navToLoginRecord() {
    wx.navigateTo({
      url: '/pages/account-security/login-record'
    });
  },

  // 显示注销账号确认弹窗
  showUnregisterDialog() {
    wx.showModal({
      title: '提示',
      content: '注销账号后所有数据将无法恢复，确定要注销吗？',
      cancelText: '取消',
      confirmText: '确定',
      confirmColor: '#f53f3f',
      success(res) {
        if (res.confirm) {
          // 执行注销逻辑
          wx.showToast({
            title: '注销功能开发中',
            icon: 'none'
          });
        }
      }
    });
  }
})