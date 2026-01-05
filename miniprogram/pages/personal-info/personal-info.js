// pages/personal-info/personal-info.js
Page({
  /**
   * 页面的初始数据
   */
  
  // 存储用户信息
  data: {
    avatarUrl: '',
    nickName: '',
    studentId: '',
    phone: '',
    dormitory: '', 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面重新加载用户信息（确保编辑后数据同步）
    this.loadUserInfo();
  },

  // 加载用户信息（从本地存储获取）
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {
      avatarUrl: this.data.avatarUrl,
      nickName: this.data.nickName,
      studentId: this.data.studentId,
      phone: this.data.phone,
      dormitory: this.data.dormitory,  
    };
    this.setData({ userInfo });
  },

  // 头像点击事件
  onAvatarTap() {
    wx.navigateTo({
      url: '../edit-profile/edit-profile'
    });
  },

  // 姓名点击事件
  onNameTap() {
    wx.navigateTo({
      url: '../edit-profile/edit-profile'
    });
  },

  // 学号点击事件
  onStuIdTap() {
    wx.navigateTo({
      url: '../edit-profile/edit-profile'
    });
  },

  // 手机号点击事件
  onPhoneTap() {
    wx.navigateTo({
      url: '../edit-profile/edit-profile'
    });
  },

  // 宿舍地址点击事件
  onDormitoryTap() {
    wx.navigateTo({
      url: '../edit-profile/edit-profile'
    });
  },

 


})