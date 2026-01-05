const cloud = require('wx-server-sdk')
const axios = require('axios')
const jwt = require('jsonwebtoken')

cloud.init()
const db = cloud.database()

const APPID = process.env.WX_APPID
const SECRET = process.env.WX_APPSECRET
const JWT_SECRET = 'your-jwt-secret'

exports.main = async (event) => {
  const { loginCode, phoneCode } = event

  if (!loginCode || !phoneCode) {
    throw new Error('缺少参数')
  }

  // 1. 换 openid / session_key
  const sessionRes = await axios.get(
    'https://api.weixin.qq.com/sns/jscode2session',
    {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: loginCode,
        grant_type: 'authorization_code'
      }
    }
  )

  const { openid } = sessionRes.data
  if (!openid) throw new Error('获取 openid 失败')

  // 2. 用 phoneCode 换手机号
  const phoneRes = await axios.post(
    `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${await getAccessToken()}`,
    { code: phoneCode }
  )

  const phoneNumber = phoneRes.data.phone_info.phoneNumber

  // 3. 查用户
  const userQuery = await db
    .collection('users')
    .where({ openid })
    .get()

  let user
  if (userQuery.data.length === 0) {
    // 新用户
    const newUser = {
      openid,
      phone: phoneNumber,
      createdAt: new Date()
    }
    const addRes = await db.collection('users').add({ data: newUser })
    user = { ...newUser, _id: addRes._id }
  } else {
    user = userQuery.data[0]
  }

  // 4. 生成 token
  const token = jwt.sign(
    { uid: user._id, openid },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, user }
}

// 获取 access_token（可加缓存）
async function getAccessToken() {
  const res = await axios.get(
    'https://api.weixin.qq.com/cgi-bin/token',
    {
      params: {
        grant_type: 'client_credential',
        appid: APPID,
        secret: SECRET
      }
    }
  )
  return res.data.access_token
}
