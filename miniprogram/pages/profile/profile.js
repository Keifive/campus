// pages/profile/profile.js
const orderManager = require('../../utils/orderManager.js');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    wallet: {
      balance: 0,
      frozen: 0,
      totalIncome: 0
    },
    taskStats: {
      published: 0,
      accepted: 0,
      completed: 0,
      favorites: 0
    },
    addressCount: 0
  },

  onLoad() {
    console.log('个人页面加载')
  },

  onShow() {
    this.checkLoginStatus()
    // 如果已登录，重新加载用户数据以更新统计
    if (this.data.isLoggedIn) {
      this.loadUserData()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false
    const userInfo = wx.getStorageSync('userInfo')
    
    if (isLoggedIn && userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      })
      this.loadUserData()
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        wallet: { balance: 0, frozen: 0, totalIncome: 0 },
        taskStats: { published: 0, accepted: 0, completed: 0, favorites: 0 },
        addressCount: 0
      })
    }
  },

  // 加载用户数据
  loadUserData() {
    if (!this.data.isLoggedIn || !this.data.userInfo) return
    
    const userInfo = this.data.userInfo;
    const userId = userInfo.id || userInfo.studentId;
    
    if (!userId) {
      console.warn('用户ID不存在');
      return;
    }
    
    // 加载钱包数据
    const walletData = wx.getStorageSync(`wallet_${userInfo.studentId}`) || {
      balance: 0,
      frozen: 0,
      totalIncome: 0
    }
    
    // 从全局订单管理器获取统计数据
    const expressOrders = orderManager.getOrders('express');
    const buyOrders = orderManager.getOrders('buy');
    const urgentOrders = orderManager.getOrders('urgent');
    const rentOrders = orderManager.getOrders('rent');
    const companyOrders = orderManager.getOrders('company');
    
    // 合并所有订单
    const allOrders = [...expressOrders, ...buyOrders, ...urgentOrders, ...rentOrders, ...companyOrders];
    
    // 统计：我发布的 = publisherId 等于当前用户ID的订单
    const publishedOrders = allOrders.filter(o => o.publisherId === userId);
    
    // 统计：我接单的 = accepterId 等于当前用户ID 且 status === 'accepted' 或 'completed'
    const acceptedOrders = allOrders.filter(o => 
      o.accepterId === userId && (o.status === 'accepted' || o.status === 'completed')
    );
    
    // 统计：已完成的 = (publisherId 或 accepterId 等于当前用户ID) 且 status === 'completed'
    const completedOrders = allOrders.filter(o => 
      (o.publisherId === userId || o.accepterId === userId) && o.status === 'completed'
    );
    
    // 统计：收藏 = 本地存储的收藏ID数量
    const favoriteIds = wx.getStorageSync('favoriteIds') || [];
    
    const updatedTaskStats = {
      published: publishedOrders.length,
      accepted: acceptedOrders.length,
      completed: completedOrders.length,
      favorites: favoriteIds.length
    }
    
    this.setData({
      wallet: walletData,
      taskStats: updatedTaskStats,
      addressCount: wx.getStorageSync(`addresses_${userInfo.studentId}`)?.length || 0
    })
  },

  // 订单更新回调
  onOrderUpdate: function(type) {
    this.loadUserData();
  },

  // 显示登录提示
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '登录后可查询、使用该服务，是否登录？',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.navigateToLogin()
        }
      }
    })
  },

  // 跳转到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login?from=profile'
    })
  },

  // 跳转到编辑个人信息
  navigateToEditProfile() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    // 跳转到编辑页面（如果存在）
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 跳转到我发布的任务
  navigateToMyPublish() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-publish/my-publish'
    })
  },

  // 跳转到我接单的任务
  navigateToMyAccepted() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-accept/my-accept'
    })
  },

  // 跳转到我完成的任务
  navigateToMyCompleted() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-completed/my-completed'
    })
  },

  // 跳转到我的收藏
  navigateToMyFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-favorites/my-favorites'
    })
  },

  // 跳转到所有任务
  navigateToAllTasks() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.showActionSheet({
      itemList: ['我发布的任务', '我接单的任务'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.navigateToMyPublish()
        } else if (res.tapIndex === 1) {
          this.navigateToMyAccepted()
        }
      }
    })
  },

  // 跳转到我的钱包 - 修改后：跳转到页面
  navigateToMyWallet() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    // 修改这里：从显示提示改为跳转到钱包页面
    wx.navigateTo({
      url: '/pages/my-wallet/my-wallet'
    })
  },

  // 跳转到地址管理 - 修改后：跳转到页面
  navigateToAddress() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    // 修改这里：从显示提示改为跳转到地址页面
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 跳转到系统设置
  navigateToSettings() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 跳转到关于我们
  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 跳转到意见反馈
  navigateToFeedback() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 显示信用分详情
  showCreditScoreInfo() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.showModal({
      title: '信用分说明',
      content: '信用分是根据您的任务完成率、用户评价等计算得出。信用分越高，平台推荐任务越多。\n\n当前信用分：' + (this.data.userInfo?.creditScore || 100),
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 选择头像
  chooseAvatar() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.selectImageFromAlbum()
        } else if (res.tapIndex === 1) {
          this.takePhoto()
        }
      }
    })
  },

  selectImageFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.updateAvatar(res.tempFilePaths[0])
      }
    })
  },

  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.updateAvatar(res.tempFilePaths[0])
      }
    })
  },

  updateAvatar(tempFilePath) {
    wx.showLoading({ title: '更新中...' })

    const cloudPath = `avatars/${this.data.userInfo.studentId || 'user'}_${Date.now()}.png`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    }).then(res => {
      const userInfo = { ...this.data.userInfo, avatarUrl: res.fileID }

      this.setData({ userInfo })

      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync(`userInfo_${userInfo.studentId}`, userInfo)
      // 同步给 getUserById 使用的缓存
      wx.setStorageSync(`user_${userInfo.studentId}`, {
        studentId: userInfo.studentId,
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || ''
      })

      // 写回云端用户表，其他设备可读取到最新头像
      const db = wx.cloud.database()
      db.collection('users').doc(userInfo.studentId).update({
        data: { avatarUrl: userInfo.avatarUrl }
      }).catch(err => {
        console.error('更新云端头像失败', err)
      })

      wx.showToast({ title: '头像更新成功', icon: 'success' })
    }).catch(err => {
      console.error('头像上传失败', err)
      wx.showToast({ title: '上传失败，请稍后重试', icon: 'none' })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('isLoggedIn')
          wx.removeStorageSync('currentStudentId')
          
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            wallet: { balance: 0, frozen: 0, totalIncome: 0 },
            taskStats: { published: 0, accepted: 0, completed: 0, favorites: 0 }
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})
