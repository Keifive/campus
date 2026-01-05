// index.js
Page({
  data: {
    // 功能入口配置，便于统一控制文案与跳转
    services: [
      { key: 'express', title: '代取快递', desc: '宿舍门口即刻送达', icon: '快', color: '#34c38f' },
      { key: 'buy', title: '代买服务', desc: '帮你跑腿买东西', icon: '买', color: '#0db4a8' },
      { key: 'urgent', title: '代办急事', desc: '紧急任务即时响应', icon: '急', color: '#ff9f43' },
      { key: 'company', title: '陪替服务', desc: '陪伴到场、代排等', icon: '陪', color: '#6a89cc' },
      { key: 'rent', title: '租借物品', desc: '常用物品短租', icon: '租', color: '#c363f5' }
    ],
    // 数据概览区可展示今日活跃度、评分等信息
    stats: [
      { value: 5, label: '待接单' },
      { value: 12, label: '今日已完成' },
      { value: '4.9', label: '服务评分' }
    ],
    // 今日亮点/公告模块，方便后续拓展
    highlights: [
      { title: '新手福利', content: '首次下单享受校园公益折扣', tag: '福利' },
      { title: '安全提示', content: '下单前确认联系人与取件码信息', tag: '提醒' }
    ]
  },

  onLoad: function() {
    console.log('首页加载');
  },
  // 统一入口，根据 key 调用对应业务处理
  onServiceTap(event) {
    const { key } = event.currentTarget.dataset;
    switch (key) {
      case 'express':
        this.navigateToExpress();
        break;
      case 'buy':
        this.navigateToBuy();
        break;
      case 'urgent':
        this.navigateToUrgent();
        break;
      case 'company':
        this.navigateToCompany();
        break;
      case 'rent':
        this.navigateToRent();
        break;
      default:
        wx.showToast({
          title: '功能建设中',
          icon: 'none'
        });
    }
  },

  // 检查登录状态
  checkLogin: function() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用该功能',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login?from=index'
            });
          }
        }
      });
      return false;
    }
    return true;
  },

  // 导航到代取快递页面
  navigateToExpress(){
    if (!this.checkLogin()) return;
    
    wx.showToast({
      title: '代取快递',
      icon: 'none'
    });

     wx.navigateTo({
       url: '/pages/express/express'
     });
  },

  // 导航到代买服务页面
  navigateToBuy() {
    if (!this.checkLogin()) return;
    
    wx.showToast({
      title: '代买服务',
      icon: 'none'
    });
    wx.navigateTo({
      url: '/pages/buy-it/buy'
    });
  },

  // 导航到代办急事页面
  navigateToUrgent() {
    if (!this.checkLogin()) return;
    
    wx.showToast({
      title: '代办急事',
      icon: 'none'
    });
    wx.navigateTo({
      url: '/pages/urgent/urgent'
    });
  },

  // 导航到陪替服务页面
  navigateToCompany() {
    if (!this.checkLogin()) return;
    
    wx.showToast({
      title: '陪替服务',
      icon: 'none'
    });
    wx.navigateTo({
      url: '/pages/company/company'
    });
  },

  // 导航到租借物品页面
  navigateToRent() {
    if (!this.checkLogin()) return;
    
    wx.showToast({
      title: '租借物品',
      icon: 'none'
    });
    wx.navigateTo({
      url: '/pages/rent/rent'
    });
  }
})