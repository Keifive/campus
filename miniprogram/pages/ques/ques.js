// pages/ques/ques.js
const { getAllQues, getUserById } = require('../../utils/userHelper.js')

Page({
  data: { quesList: [] },

  onLoad() { this.loadQuesList() },
  onShow() { this.loadQuesList() },

  async loadQuesList() {
    const allQues = await getAllQues()
    const list = await Promise.all(
      allQues.map(async q => {
        const user = await getUserById(q.userId)
        return {
          ...q,
          id: q._id || q.id,          // 供跳转用
          userName: user.nickName,
          userAvatar: user.avatarUrl,
          likeCount: (q.likedUsers || []).length
        }
      })
    )
    list.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
    this.setData({ quesList: list })
  },

  checkLogin() {
    if (!wx.getStorageSync('isLoggedIn')) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用该功能',
        confirmText: '去登录',
        success: res => res.confirm && wx.navigateTo({ url: '/pages/login/login?from=ques' })
      })
      return false
    }
    return true
  },

  goToPublish() { if (this.checkLogin()) wx.navigateTo({ url: '/pages/ques/ques-publish' }) },
  goToDetail(e) { wx.navigateTo({ url: `/pages/ques/ques-detail?id=${e.currentTarget.dataset.id}` }) },
  goToMyQues() { if (this.checkLogin()) wx.navigateTo({ url: '/pages/ques/my-ques' }) }
})
