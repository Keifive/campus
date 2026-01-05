// utils/orderService.js
// 调用后端 REST API 进行订单持久化
// 注意：需在 utils/api.js 中配置 BASE_URL

const api = require('./api')

function getOrders (type) {
  return api.get(`/orders/${type}`) // GET /orders/express
}

function createOrder (type, data) {
  return api.post(`/orders/${type}`, data) // POST /orders/express
}

function updateOrder (type, id, data) {
  return api.put(`/orders/${type}/${id}`, data) // PUT /orders/express/:id
}

function acceptOrder (type, id) {
  return api.post(`/orders/${type}/${id}/accept`) // POST /orders/express/:id/accept
}

function completeOrder (type, id) {
  return api.post(`/orders/${type}/${id}/complete`) // POST /orders/express/:id/complete
}

function cancelOrder (type, id) {
  return api.post(`/orders/${type}/${id}/cancel`) // POST /orders/express/:id/cancel
}

module.exports = {
  getOrders,
  createOrder,
  updateOrder,
  acceptOrder,
  completeOrder,
  cancelOrder
}

