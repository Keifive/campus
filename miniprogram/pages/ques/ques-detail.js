// pages/ques/ques-detail.js
const { getUserById, updateQues } = require('../../utils/userHelper.js')
const db = wx.cloud.database()

Page({
  data: { quesId: '', quesDetail: {}, commentText: '', inputFocus: false },

  onLoad(options) {
    if (options.id) {
      this.setData({ quesId: options.id })
      this.loadQuesDetail()
    }
  },

  async loadQuesDetail() {
    const { data: detail } = await db.collection('ques').doc(this.data.quesId).get()
    if (!detail) {
      wx.showToast({ title: '问题不存在', icon: 'none' })
      return setTimeout(() => wx.navigateBack(), 1500)
    }

    // 覆盖最新的头像/昵称
    const owner = await getUserById(detail.userId)
    detail.userName = owner.nickName
    detail.userAvatar = owner.avatarUrl

    const studentId = wx.getStorageSync('currentStudentId')
    detail.isLiked = studentId && (detail.likedUsers || []).includes(studentId)

    if (detail.comments) {
      detail.comments = await Promise.all(
        detail.comments.map(async c => {
          const user = await getUserById(c.userId)
          return { ...c, userName: user.nickName, userAvatar: user.avatarUrl }
        })
      )
    }

    this.setData({ quesDetail: detail })
  },

  previewImage(e) {
    wx.previewImage({ current: e.currentTarget.dataset.url, urls: this.data.quesDetail.images })
  },

  async toggleLike() {
    const studentId = wx.getStorageSync('currentStudentId')
    if (!studentId) return wx.showToast({ title: '请先登录', icon: 'none' })

    const detail = { ...this.data.quesDetail }
    if (!detail.likedUsers) detail.likedUsers = []

    const idx = detail.likedUsers.indexOf(studentId)
    idx > -1 ? detail.likedUsers.splice(idx, 1) : detail.likedUsers.push(studentId)
    detail.isLiked = idx === -1
    detail.likeCount = detail.likedUsers.length

    await updateQues(this.data.quesId, { likedUsers: detail.likedUsers, likeCount: detail.likeCount })
    this.setData({ quesDetail: detail })
    wx.showToast({ title: detail.isLiked ? '点赞成功' : '已取消点赞', icon: 'none' })
  },

  focusInput() { this.setData({ inputFocus: true }) },
  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },

  async submitComment() {
    const text = this.data.commentText.trim()
    if (!text) return wx.showToast({ title: '请输入评论内容', icon: 'none' })

    const studentId = wx.getStorageSync('currentStudentId')
    if (!studentId) return wx.showToast({ title: '请先登录', icon: 'none' })

    const me = await getUserById(studentId)
    const comment = {
      id: 'comment_' + Date.now(),
      userId: studentId,
      userName: me.nickName,
      userAvatar: me.avatarUrl,
      content: text,
      time: new Date().toLocaleString('zh-CN')
    }

    const detail = { ...this.data.quesDetail }
    detail.comments = [...(detail.comments || []), comment]
    detail.commentCount = detail.comments.length

    await updateQues(this.data.quesId, { comments: detail.comments, commentCount: detail.commentCount })
    this.setData({ quesDetail: detail, commentText: '', inputFocus: false })
    wx.showToast({ title: '评论成功', icon: 'success' })
  }
})
