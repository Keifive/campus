// utils/api.js
// 统一网络请求封装，基于 Promise
// 使用：const api = require('../../utils/api')
//       api.get('/orders/express').then(...)

const BASE_URL = 'https://your.domain.com/api'  // TODO: 替换为真实后端地址

const { getToken } = require('./auth')

function request (url, { method = 'GET', data = {}, header = {} } = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: { ...header, Authorization: getToken() ? `Bearer ${getToken()}` : '' },
      timeout: 10000,
      success: (res) => {
        // 兼容后端统一格式 { code, data, message }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 统一校验业务 code
          if (typeof res.data === 'object' && res.data.code !== undefined) {
            if (res.data.code === 0) {
              resolve(res.data)
            } else {
              reject(res.data) // { code, message }
            }
          } else {
            // 若后端未包裹 code，直接返回
            resolve(res.data)
          }
        } else {
          reject(res.data || { message: '网络错误', code: -1 })
        }
      },
      fail: (err) => reject(err)
    })
  })
}

function get (url, data) {
  return request(url, { method: 'GET', data })
}

function post (url, data) {
  return request(url, { method: 'POST', data, header: { 'Content-Type': 'application/json' } })
}

function put (url, data) {
  return request(url, { method: 'PUT', data, header: { 'Content-Type': 'application/json' } })
}

function del (url, data) {
  return request(url, { method: 'DELETE', data })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
}

