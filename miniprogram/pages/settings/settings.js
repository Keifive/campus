// pages/settings/settings.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: true,
    appVersion: '1.0.0',
    cacheSize: '12.5MB',
    notification: {
      task: true,
      message: true,
      system: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadSettings();
  },

  /**
   * 加载设置信息
   */
  loadSettings() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    const settings = wx.getStorageSync('userSettings') || {};
    
    this.setData({
      isLoggedIn: !!userInfo,
      notification: {
        ...this.data.notification,
        ...settings.notification
      }
    });
    
    // 获取缓存大小
    this.getCacheSize();
  },

  /**
   * 获取缓存大小
   */
  getCacheSize() {
    const res = wx.getStorageInfoSync();
    this.setData({
      cacheSize: (res.currentSize / 1024).toFixed(1) + 'MB'
    });
  },

  /**
   * 跳转到个人信息
   */
  navigateToProfile() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }

    wx.navigateTo({
      url: '/pages/personal-info/personal-info',
    });
  },
 
  /**
   * 跳转到账号安全
   */
  navigateToSecurity() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }

    wx.navigateTo({
      url: '/pages/account-security/account-security',
    });
  },

  /**
   * 跳转到隐私设置
   */
  navigateToPrivacy() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }

    wx.navigateTo({
      url: '/pages/privacy/privacy',
    });
  },

  /**
   * 跳转到关于我们
   */
  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/about',
    });
  },

  /**
   * 跳转到意见反馈
   */
  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    });
  },

  /**
   * 显示帮助中心
   */
  showHelpCenter() {
    wx.showModal({
      title: '帮助中心',
      content: '常见问题与使用指南\n1. 如何发布任务？\n2. 如何接单完成任务？\n3. 如何提现？\n4. 遇到问题怎么办？',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 切换任务通知
   */
  toggleTaskNotification(e) {
    const value = e.detail.value;
    this.updateNotificationSetting('task', value);
  },

  /**
   * 切换消息通知
   */
  toggleMessageNotification(e) {
    const value = e.detail.value;
    this.updateNotificationSetting('message', value);
  },

  /**
   * 切换系统通知
   */
  toggleSystemNotification(e) {
    const value = e.detail.value;
    this.updateNotificationSetting('system', value);
  },

  /**
   * 更新通知设置
   */
  updateNotificationSetting(key, value) {
    const newNotification = {
      ...this.data.notification,
      [key]: value
    };
    
    this.setData({
      notification: newNotification
    });
    
    // 保存到本地存储
    const settings = wx.getStorageSync('userSettings') || {};
    settings.notification = newNotification;
    wx.setStorageSync('userSettings', settings);
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    });
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？\n清除后需要重新登录',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          this.confirmClearCache();
        }
      }
    });
  },

  /**
   * 确认清除缓存
   */
  confirmClearCache() {
    wx.showLoading({
      title: '清除中...',
    });
    
    setTimeout(() => {
      // 清除所有缓存
      wx.clearStorageSync();
      
      this.setData({
        cacheSize: '0.0MB',
        isLoggedIn: false
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '缓存已清除',
        icon: 'success'
      });
      
      // 返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        });
      }, 1500);
    }, 1000);
  },

  /**
   * 检查更新
   */
  checkUpdate() {
    wx.showLoading({
      title: '检查中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '已是最新版本',
        icon: 'success'
      });
    }, 800);
  },

  /**
   * 处理退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          this.confirmLogout();
        }
      }
    });
  },

  /**
   * 确认退出登录
   */
  confirmLogout() {
    // 清除登录状态
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    wx.removeStorageSync('isLoggedIn'); // 清除登录标志
    wx.removeStorageSync('currentStudentId');
    
    this.setData({
      isLoggedIn: false
    });
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
    
    // 返回首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index',
      });
    }, 1500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '校园代取-系统设置',
      path: '/pages/settings/settings'
    };
  }
});