// utils/userHelper.js
const db = wx.cloud.database()

/* ---------- 用户 ---------- */
const getUserById = async (studentId) => {
  if (!studentId) return { nickName: '未知用户', avatarUrl: '' }

  const cacheKey = `user_${studentId}`
  const cached = wx.getStorageSync(cacheKey)

  // 如果缓存里已有头像，则直接用；否则尝试刷新，避免空头像被一直缓存
  if (cached && cached.avatarUrl) return cached

  // 兼容：若本地 userInfo 与目标学号一致，先用它兜底
  const local = wx.getStorageSync('userInfo')
  if (local && local.studentId === studentId && (local.nickName || local.avatarUrl)) {
    const user = { studentId, nickName: local.nickName || '', avatarUrl: local.avatarUrl || '' }
    wx.setStorageSync(cacheKey, user)
    return user
  }

  try {
    const { data } = await db.collection('users').doc(studentId).get()
    const user = { studentId: data.studentId, nickName: data.nickName || '', avatarUrl: data.avatarUrl || '' }
    // 只有真实头像时才缓存，避免缓存空值
    if (user.avatarUrl || user.nickName) {
      wx.setStorageSync(cacheKey, user)
    }
    return user
  } catch {
    return { studentId, nickName: `用户${studentId.slice(-3)}`, avatarUrl: '' }
  }
}

/* ---------- 问题 ---------- */
const getAllQues = async () => {
  const { data } = await db.collection('ques').get()
  return data
}

const addQues = async (ques) => {
    try {
      const res = await db.collection('ques').add({ data: ques })
      console.log('写入成功：', res)
      return res
    } catch (err) {
      console.error('写入失败：', err)
      throw err
    }
  }

const updateQues = async (id, newData) => {
  return await db.collection('ques').doc(id).update({ data: newData })
}

// 删除指定ID的问题
const deleteQues = async (id) => {
    try {
      const res = await db.collection('ques').doc(id).remove()
      console.log('问题删除成功：', res)
      return res
    } catch (err) {
      console.error('问题删除失败：', err)
      throw err
    }
  }

module.exports = { getUserById, getAllQues, addQues, updateQues, deleteQues }
