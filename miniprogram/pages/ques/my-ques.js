// pages/ques/my-ques.js
const { getAllQues, getUserById, updateQues } = require('../../utils/userHelper.js')

Page({
  data: { myQuesList: [] },

  onLoad() { this.loadMyQues() },
  onShow() { this.loadMyQues() },

  async loadMyQues() {
    const studentId = wx.getStorageSync('currentStudentId')
    if (!studentId) return wx.redirectTo({ url: '/pages/login/login' })
  
    const me = await getUserById(studentId)
    const allQues = await getAllQues()
    
    const myQuesList = allQues
      .filter(q => q.userId === studentId && !q.deleted) // 只取当前用户且未删除的
      .map(q => {
        // 构造一个更友好的问题对象，确保各字段存在且有默认值
        let publishTimeStr = ''
        if (q.publishTime) {
          // 假设 q.publishTime 是时间戳（如 1600000000000）或 ISO 字符串
          const date = new Date(q.publishTime)
          if (!isNaN(date.getTime())) {
            publishTimeStr = date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          } else {
            publishTimeStr = '未知时间'
          }
        } else {
          publishTimeStr = '未知时间'
        }
  
        return {
          ...q,
          id: q._id || q.id,             // 用于跳转详情
          userName: me.nickName,
          content: q.content || '',             // 确保 content 有默认值
          images: q.images || [],               // 确保 images 是数组
          publishTime: publishTimeStr,          // 格式化后的时间字符串
          likeCount: q.likeCount || 0,          // 默认 0
          commentCount: q.commentCount || 0     // 默认 0
        }
      })
      .sort((a, b) => new Date(b.publishTime || 0) - new Date(a.publishTime || 0)) // 排序仍然基于原始时间，最好用 Date 对象排序
  
    this.setData({ myQuesList })
    },

  goToDetail(e) { wx.navigateTo({ url: `/pages/ques/ques-detail?id=${e.currentTarget.dataset.id}` }) },

  async deleteQues(e) {
    const id = e.currentTarget.dataset.id
    const modal = await wx.showModal({ title: '提示', content: '确定要删除这个问题吗？' })
    if (!modal.confirm) return
  
    try {
      const res = await wx.cloud.callFunction({
        name: 'deleteQues',
        data: { id }
      })
      console.log('[deleteQues] 云函数返回', res.result) // ← 看返回内容
  
      if (!res.result.success) {
        throw new Error(res.result.message || '删除失败')
      }
  
      await this.loadMyQues()
      wx.showToast({ title: '删除成功', icon: 'success' })
    } catch (err) {
      console.error('[deleteQues] 调用失败', err)
      wx.showToast({ title: err.message || '删除失败', icon: 'error' })
    }
  }
})
