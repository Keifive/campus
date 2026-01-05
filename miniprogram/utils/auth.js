// utils/auth.js
// 处理登录与 token 管理
const api = require('./api')

const TOKEN_KEY = 'token'

async function login () {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 10000,
      success: async res => {
        if (!res.code) return reject(new Error('wx.login 无 code'))
        try {
          // 向后端换取自定义登录态，后端需返回 { code:0, data:{ token, openid } }
          const resp = await api.post('/auth/login', { code: res.code })
          const { token, openid } = resp.data
          wx.setStorageSync(TOKEN_KEY, token)
          wx.setStorageSync('openid', openid)
          resolve(openid)
        } catch (err) {
          reject(err)
        }
      },
      fail: reject
    })
  })
}

function getToken () {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

module.exports = {
  login,
  getToken
}

