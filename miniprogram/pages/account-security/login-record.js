// pages/login-record/login-record.js
Page({
  data: {
    records: []
  },

  onLoad() {
    // 模拟从接口获取登录记录
    this.fetchLoginRecords();
  },

  fetchLoginRecords() {
    // 实际项目中应调用接口获取数据
    const mockRecords = [
      {
        time: '2023-11-05 09:45:22',
        device: 'iPhone 13 (iOS 16.3)',
        location: '北京市 中国移动',
        isRisk: false
      },
      {
        time: '2023-11-04 18:22:15',
        device: '小米12 (Android 13)',
        location: '上海市 中国联通',
        isRisk: false
      },
      {
        time: '2023-11-03 22:10:08',
        device: 'MacBook Pro (macOS 13.2)',
        location: '广州市 中国电信',
        isRisk: false
      },
      {
        time: '2023-11-02 03:55:44',
        device: '未知设备 (Windows 10)',
        location: '海外IP 未知运营商',
        isRisk: true
      }
    ];

    this.setData({ records: mockRecords });
  }
})