// pages/ques/ques-publish.js
const { getUserById, addQues } = require('../../utils/userHelper.js')

Page({
  data: { content: '', images: [] },

  onContentInput(e) { this.setData({ content: e.detail.value }) },

  chooseImage() {
    const remain = 9 - this.data.images.length
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => this.setData({ images: [...this.data.images, ...res.tempFilePaths] })
    })
  },

  deleteImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(idx, 1)
    this.setData({ images })
  },

  async submitQues() {
    const content = this.data.content.trim()
    if (!content) {
      return wx.showToast({ title: '请输入问题描述', icon: 'none' })
    }

    wx.showLoading({ title: '发布中...' })

    const studentId = wx.getStorageSync('currentStudentId')
    if (!studentId) {
      wx.hideLoading()
      return wx.showToast({ title: '请先登录', icon: 'none' })
    }

    try {
      const me = await getUserById(studentId)

      const quesData = {
        content,
        images: this.data.images,
        userId: studentId,
        userName: me.nickName,
        userAvatar: me.avatarUrl,
        publishTime: new Date().toLocaleString('zh-CN'),
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        likedUsers: [],
        comments: []
      }

      await addQues(quesData)

      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      wx.hideLoading()
      console.error('发布失败：', err)
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    }
  }
})