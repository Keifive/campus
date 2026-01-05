// pages/feedback/feedback.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    feedbackTypes: [
      { label: '功能建议', value: 'suggestion' },
      { label: '问题反馈', value: 'bug' },
      { label: '体验问题', value: 'experience' },
      { label: '其他', value: 'other' }
    ],
    selectedType: 'suggestion',
    content: '',
    images: [],
    contact: '',
    canSubmit: false,
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载历史反馈信息
    this.loadDraft();
  },

  /**
   * 加载草稿
   */
  loadDraft() {
    const draft = wx.getStorageSync('feedbackDraft');
    if (draft) {
      this.setData({
        selectedType: draft.selectedType || 'suggestion',
        content: draft.content || '',
        contact: draft.contact || ''
      });
      this.checkSubmitStatus();
    }
  },

  /**
   * 选择反馈类型
   */
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
    this.saveDraft();
  },

  /**
   * 输入反馈内容
   */
  onContentInput(e) {
    const content = e.detail.value;
    this.setData({ content });
    this.checkSubmitStatus();
    this.saveDraft();
  },

  /**
   * 输入联系方式
   */
  onContactInput(e) {
    const contact = e.detail.value;
    this.setData({ contact });
    this.saveDraft();
  },

  /**
   * 检查是否可以提交
   */
  checkSubmitStatus() {
    const canSubmit = this.data.content.length >= 10;
    this.setData({ canSubmit });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    if (this.data.images.length >= 3) {
      wx.showToast({
        title: '最多上传3张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: 3 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const newImages = [...this.data.images, ...res.tempFilePaths];
        this.setData({ images: newImages });
      }
    });
  },

  /**
   * 移除图片
   */
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  /**
   * 保存草稿
   */
  saveDraft() {
    const draft = {
      selectedType: this.data.selectedType,
      content: this.data.content,
      contact: this.data.contact
    };
    wx.setStorageSync('feedbackDraft', draft);
  },

  /**
   * 提交反馈
   */
  submitFeedback() {
    if (!this.data.canSubmit || this.data.isSubmitting) return;

    // 验证内容长度
    if (this.data.content.length < 10) {
      wx.showToast({
        title: '请至少输入10个字符',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSubmitting: true });

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    // 准备提交数据
    const feedbackData = {
      type: this.data.selectedType,
      content: this.data.content,
      images: this.data.images,
      contact: this.data.contact,
      userId: userInfo.id || 'anonymous',
      nickName: userInfo.nickName || '匿名用户',
      time: new Date().toISOString()
    };

    // 模拟API提交
    wx.showLoading({
      title: '提交中...',
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isSubmitting: false });
      
      // 清空草稿
      wx.removeStorageSync('feedbackDraft');
      
      // 显示提交成功
      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈！\n我们会在1-3个工作日内处理。',
        showCancel: false,
        confirmText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 返回上一页
            wx.navigateBack();
          }
        }
      });
    }, 2000);
  },

  /**
   * 页面卸载时保存草稿
   */
  onUnload() {
    if (this.data.content) {
      this.saveDraft();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '校园代取-意见反馈',
      path: '/pages/feedback/feedback'
    };
  }
});