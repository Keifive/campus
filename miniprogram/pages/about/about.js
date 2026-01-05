// pages/about/about.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appVersion: '1.0.0',
    teamMembers: [
      {
        id: 1,
        name: '马飘挧',
        role: '项目负责人',
        desc: '负责后端用户权限模块',
        avatar: '/images/avatar1.png'
      },
      {
        id: 2,
        name: '郭思羽',
        role: '前端开发',
        desc: '小程序核心界面实现',
        avatar: '/images/avatar2.png'
      },
      {
        id: 3,
        name: '王岚',
        role: '前端开发',
        desc: '小程序个人中心界面实现',
        avatar: '/images/avatar3.png'
      },
      {
        id: 4,
        name: '张智珺',
        role: '前端开发',
        desc: '小程序个人中心界面实现',
        avatar: '/images/avatar4.png'
      },
      {
        id: 5,
        name: '吴家欣',
        role: '前端开发',
        desc: '小程序订单界面实现',
        avatar: '/images/avatar5.png'
      },
      {
        id: 6,
        name: '周灿',
        role: '后端开发',
        desc: '负责后端用户权限模块',
        avatar: '/images/avatar6.png'
      },
      {
        id: 7,
        name: '包昕媛',
        role: '后端开发',
        desc: '负责订单功能实现',
        avatar: '/images/avatar7.png'
      },
      {id: 8,
        name: '谢璇',
        role: '后端开发',
        desc: '负责订单功能实现',
        avatar: '/images/avatar8.png'
      },

    ],
    contactInfo: {
      email: 'contact@campus-helper.com',
      phone: '123-4567-8901',
      address: '广东省汕头市大学路243号'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以在这里加载动态数据
  },

  /**
   * 复制联系方式
   */
  copyContact(e) {
    const type = e.currentTarget.dataset.type;
    let content = '';
    
    switch (type) {
      case 'email':
        content = this.data.contactInfo.email;
        break;
      default:
        return;
    }
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 拨打电话
   */
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.contactInfo.phone.replace(/-/g, '')
    });
  },

  /**
   * 打开地图
   */
  openLocation() {
    wx.openLocation({
      name: '汕头大学',
      address: this.data.contactInfo.address,
      latitude: 23.3466,
      longitude: 116.6821,
      scale: 18
    });
  },

  /**
   * 分享应用
   */
  shareApp() {
    // 分享按钮已通过 open-type="share" 实现
  },

  /**
   * 评价应用
   */
  rateApp() {
    wx.showModal({
      title: '感谢评价',
      content: '感谢您使用校园代取小程序！\n您的评价对我们非常重要。',
      confirmText: '去评价',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到评价页面或引导用户评价
          wx.showToast({
            title: '感谢您的支持！',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '校园代取 - 让校园生活更便捷',
      path: '/pages/index/index',
      imageUrl: '/images/share-logo.png'
    };
  }
});