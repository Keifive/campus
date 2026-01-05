const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  console.log('[deleteQues] 收到 id =', id)   // ← 关键日志

  if (!id) {
    console.error('[deleteQues] id 为空')
    return { success: false, message: '缺少 id' }
  }

  try {
    const res = await db.collection('ques').doc(id).remove()
    console.log('[deleteQues] 删除结果', res) // ← 看是否成功
    return { success: true, message: '问题已删除', res }
  } catch (err) {
    console.error('[deleteQues] 删除异常', err)
    return { success: false, message: '删除失败', error: err }
  }
}