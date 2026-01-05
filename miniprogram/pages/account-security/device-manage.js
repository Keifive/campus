// pages/device-manage/device-manage.js
Page({
  data: {
    devices: [
      {
        name: 'iPhone 13',
        system: 'iOS 16.3',
        loginTime: '今天 09:45',
        isCurrent: true
      },
      {
        name: '小米12',
        system: 'Android 13',
        loginTime: '昨天 18:22',
        isCurrent: false
      },
      {
        name: 'MacBook Pro',
        system: 'macOS 13.2',
        loginTime: '2023-10-15 14:30',
        isCurrent: false
      }
    ]
  },

  onLoad() {
    // 实际项目中应从接口获取设备列表
  },

  removeDevice(e) {
    const { index } = e.currentTarget.dataset;
    const { devices } = this.data;
    
    wx.showModal({
      title: '确认移除',
      content: `确定要移除${devices[index].name}吗？`,
      cancelText: '取消',
      confirmText: '确定',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          // 模拟移除设备接口调用
          wx.showLoading({ title: '移除中...' });
          
          setTimeout(() => {
            const newDevices = devices.filter((_, i) => i !== index);
            this.setData({ devices: newDevices });
            wx.hideLoading();
            wx.showToast({ title: '移除成功' });
          }, 800);
        }
      }
    });
  }
})