//pages/privacy/info-visibility.js
Page({
  data: {
    onlyReceiverVisible: false
  },

  onLoad() {
    // 从后端获取当前设置
    wx.request({
      url: '/api/user/getSetting',
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      success: res => {
        this.setData({ onlyReceiverVisible: res.data.onlyReceiverVisible });
      }
    });
  },

  // 切换可见性开关
  async handleVisibleChange(e) {
    const isChecked = e.detail.value;
    await wx.request({
      url: '/api/user/updateSetting',
      method: 'POST',
      data: { onlyReceiverVisible: isChecked },
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` }
    });
    this.setData({ onlyReceiverVisible: isChecked });
  }
});