# 支付功能集成指南

## 功能概述

本项目已集成完整的支付流程，支持微信支付和支付宝支付两种方式。

## 支付流程

1. 用户点击"去支付"按钮
2. 跳转到支付页面，显示订单信息
3. 用户选择支付方式（微信支付/支付宝）
4. 点击"确认支付"进行支付
5. 显示支付结果（成功/失败）
6. 支付成功后返回上一页

## 如何在页面中集成支付功能

### 方法一：直接跳转（推荐）

在任何页面的 JS 文件中添加支付方法：

```javascript
// 跳转到支付页面
goToPayment: function() {
  const order = this.data.orderDetail; // 获取订单信息
  wx.navigateTo({
    url: `/pages/payment/payment?orderId=${order.id}&amount=${order.price}&title=${encodeURIComponent(order.title)}`
  });
}
```

在对应的 WXML 文件中添加支付按钮：

```xml
<view class="pay-btn" bindtap="goToPayment">
  <text>去支付</text>
</view>
```

### 方法二：使用工具函数

引入支付工具函数：

```javascript
const paymentHelper = require('../../utils/paymentHelper.js');

// 在需要支付的地方调用
paymentHelper.goToPayment({
  orderId: order.id,
  amount: order.price,
  title: order.title
});
```

## 参数说明

- `orderId` (必填): 订单ID
- `amount` (必填): 支付金额
- `title` (必填): 订单标题

## 支付记录查询

```javascript
const paymentHelper = require('../../utils/paymentHelper.js');

// 获取所有支付记录
const records = paymentHelper.getPaymentRecords();

// 根据订单ID查询支付记录
const record = paymentHelper.getPaymentByOrderId(orderId);
```

## 已集成支付的页面

- ✅ 代取快递详情页 (pages/express/express-detail)
- ✅ 代买服务详情页 (pages/buy-it/buy-detail)

## 待集成的页面（可选）

- 代办急事详情页 (pages/urgent/urgent-detail)
- 陪替服务详情页 (pages/company/company-detail)
- 租借物品详情页 (pages/rent/rent-detail)

## 样式说明

支付按钮已经定义好样式类 `.main-action.pay`，如需自定义样式请修改对应的 wxss 文件。

## 注意事项

1. 当前为模拟支付，实际项目需要接入真实的支付接口
2. 支付记录保存在本地存储中，键名为 `paymentRecords`
3. 支付成功后会自动返回上一页并触发页面刷新
