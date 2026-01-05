// utils/orderManager.js
// 本地订单缓存管理 & 与远端同步
// 兼容旧同步接口，新增异步 load / refresh 方法

const orderService = require('./orderService')

// 本地缓存，首次启动为空，由 load(type) 填充
const cache = {
  express: [],
  buy: [],
  urgent: [],
  rent: [],
  company: []
}

// 记录已加载状态，避免重复请求
const loaded = {}

function notifyUpdate (type) {
  const pages = getCurrentPages()
  pages.forEach(page => {
    if (typeof page.onOrderUpdate === 'function') {
      page.onOrderUpdate(type)
    }
  })
}

/**
 * 加载远端订单（首次或强制刷新）
 * @param {String} type 订单类别
 * @param {Boolean} force 是否强制刷新
 */
async function load (type, force = false) {
  if (loaded[type] && !force) return cache[type]
  try {
    const resp = await orderService.getOrders(type)
    cache[type] = resp.data || []
    loaded[type] = true
  } catch (e) {
    console.error('load orders error', e)
    // 保持旧数据，抛出错误给调用者
    throw e
  }
  return cache[type]
}

function getOrdersSync (type) {
  return cache[type] || []
}

// ---------- 本地增删改同步远端 ----------
async function createOrder (type, data) {
  const resp = await orderService.createOrder(type, data)
  // 后端返回新订单对象
  cache[type].unshift(resp.data)
  notifyUpdate(type)
  return resp.data
}

async function updateOrder (type, id, data) {
  await orderService.updateOrder(type, id, data)
  const idx = cache[type].findIndex(o => o.id === id)
  if (idx !== -1) {
    cache[type][idx] = { ...cache[type][idx], ...data }
    notifyUpdate(type)
  }
}

async function acceptOrder (type, id) {
  try {
    const { data } = await orderService.acceptOrder(type, id)
    _replaceLocal(type, data)
    return true
  } catch (err) {
    // 将错误抛给调用者处理（可能是并发冲突）
    throw err
  }
}

async function completeOrder (type, id) {
  const { data } = await orderService.completeOrder(type, id)
  _replaceLocal(type, data)
}

async function cancelOrder (type, id) {
  const { data } = await orderService.cancelOrder(type, id)
  _replaceLocal(type, data)
}

function _replaceLocal (type, orderObj) {
  const idx = cache[type].findIndex(o => o.id === orderObj.id)
  if (idx !== -1) {
    cache[type][idx] = orderObj
  } else {
    cache[type].unshift(orderObj)
  }
  notifyUpdate(type)
  return orderObj
}

module.exports = {
  // 加载 / 刷新
  load,
  refresh: (type) => load(type, true),
  // 只读同步缓存
  getOrdersSync,
  // 远端操作
  createOrder,
  updateOrder,
  acceptOrder,
  completeOrder,
  cancelOrder,
  // 通知方法暴露（复杂场景可直接调用）
  notifyUpdate
}
