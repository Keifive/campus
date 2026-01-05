// utils/http.js
// 简易 Promise 封装，解决旧基础库 wx.request 不支持 await 的问题
function request (options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => resolve(res),
      fail: reject
    })
  })
}

module.exports = {
  request
}

