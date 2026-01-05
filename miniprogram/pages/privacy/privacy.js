// pages/privacy/privacy.js
Page({
  data: {},

  // 跳转到授权管理
  navToAuthManage() {
    wx.navigateTo({
      url: '/pages/privacy/auth-manage'
    });
  },

  // 跳转到信息可见性设置
  navToInfoVisibility() {
    wx.navigateTo({
      url: '/pages/privacy/info-visibility'
    });
  },


  //展示隐私政策
  navToPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '欢迎使用本小程序，我们重视您的隐私保护。仅授权为本小程序提供服务的工作人员接触必要信息，且需遵守保密义务。除非法律法规要求、获得用户明确授权，否则本小程序不会将用户个人信息共享给任何第三方。',
      confirmText: '确定',
      cancelText: '取消',    
    })
  },

})