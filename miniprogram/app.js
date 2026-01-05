// app.js
App({
  onLaunch() {
    console.log('小程序启动')
    
    // 初始化测试数据
    this.initTestData()
  },

  initTestData() {
    // 如果还没有已注册用户，创建测试账号
    if (!wx.getStorageSync('registeredUsers')) {
      const testUsers = [
        {
          studentId: '20210001',
          password: '123456',
          registerTime: '2023-10-01T10:00:00Z'
        },
        {
          studentId: '20210002',
          password: '123456',
          registerTime: '2023-10-02T11:00:00Z'
        }
      ]
      wx.setStorageSync('registeredUsers', testUsers)
      console.log('测试用户数据已初始化')
    }
    
    // 为测试用户初始化任务数据（可选）
    const testUsers = wx.getStorageSync('registeredUsers') || []
    testUsers.forEach(user => {
      const studentId = user.studentId
      
      // 如果还没有任务数据，初始化示例数据
      if (!wx.getStorageSync(`tasks_${studentId}`)) {
        const sampleTasks = {
          published: [
            {
              id: 'task_001',
              type: 'express',
              title: '快递代取 - 顺丰快递',
              description: '从快递中心取一个包裹送到东区宿舍',
              reward: 8,
              status: 'completed',
              createTime: '2023-10-10 14:30',
              deadline: '2023-10-10 18:00',
              pickupLocation: '校园快递中心',
              deliveryLocation: '东区宿舍5栋',
              acceptor: {
                name: '张三',
                phone: '13800138001'
              },
              isRated: true,
              rating: 5
            }
          ],
          accepted: [
            {
              id: 'task_002',
              type: 'buy',
              title: '代买奶茶 - 一点点',
              description: '大杯珍珠奶茶，少糖少冰',
              reward: 5,
              status: 'accepted',
              createTime: '2023-10-11 15:20',
              deadline: '2023-10-11 17:00',
              pickupLocation: '商业街一点点',
              deliveryLocation: '图书馆3楼',
              publisher: {
                name: '李四',
                phone: '13800138002'
              },
              isRated: false
            }
          ],
          completed: [],
          favorites: []
        }
        
        wx.setStorageSync(`tasks_${studentId}`, sampleTasks)
        
        // 初始化统计数据
        const taskStats = {
          published: sampleTasks.published.length,
          accepted: sampleTasks.accepted.length,
          completed: sampleTasks.completed.length,
          favorites: sampleTasks.favorites.length,
          totalEarnings: 8
        }
        wx.setStorageSync(`taskStats_${studentId}`, taskStats)
        
        // 初始化钱包数据
        const walletData = {
          balance: 15.5,
          frozen: 5,
          totalIncome: 20.5
        }
        wx.setStorageSync(`wallet_${studentId}`, walletData)
      }
    })
  }
})
