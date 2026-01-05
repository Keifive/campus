// pages/login/login.js
if (!wx.cloud.inited) {
  wx.cloud.init({
    env: 'agency-5g56swjy3ce57ce4',
  })
}

Page({
  data: {
    studentId: '',
    password: '',
    confirmPassword: '',
    isRegisterMode: false,
    canSubmit: false,
    wechatLoading: false
  },

  onLoad(options) {
    if (options.from === 'profile') {
      wx.showToast({ title: '请先登录', icon: 'none' })
    }
  },

  onStudentIdInput(e) {
    this.setData({ studentId: e.detail.value.replace(/\s+/g, '') })
    this.checkSubmit()
  },
  onPasswordInput(e) {
    this.setData({ password: e.detail.value.replace(/\s+/g, '') })
    this.checkSubmit()
  },
  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value.replace(/\s+/g, '') })
    this.checkSubmit()
  },

  checkSubmit() {
    const { studentId, password, confirmPassword, isRegisterMode } = this.data
    const idOk = studentId.length >= 4
    let ok = idOk && password.length >= 1
    if (isRegisterMode) ok = ok && confirmPassword.length >= 1 && password === confirmPassword
    this.setData({ canSubmit: ok })
  },

  toggleMode() {
    this.setData({
      isRegisterMode: !this.data.isRegisterMode,
      password: '',
      confirmPassword: ''
    })
    this.checkSubmit()
  },

  /* ================== 学号登录 ================== */

  async handleLogin() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    const { studentId, password, isRegisterMode } = this.data
    wx.showLoading({ title: isRegisterMode ? '注册中...' : '登录中...' })

    try {
      if (isRegisterMode) {
        await this.doRegister(studentId, password)
      } else {
        await this.doLogin(studentId, password)
      }
    } catch (err) {
      wx.showToast({ title: err.message || '网络错误', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  /* ================== 微信一键登录 ================== */

  async handleWechatPhoneLogin(e) {
    if (this.data.wechatLoading) return

    const { errMsg, code } = e.detail || {}
    console.log('[wechatPhone] event detail:', e.detail)

    if (errMsg !== 'getPhoneNumber:ok' || !code) {
      const tip = errMsg && errMsg.includes('deny')
        ? '已取消授权，请点击允许获取手机号'
        : '手机号授权失败，请在真机点击允许'
      wx.showToast({ title: tip, icon: 'none' })
      return
    }

    this.setData({ wechatLoading: true })

    try {
      // 1. 登录 code
      const loginRes = await wx.login()
      const loginCode = loginRes.code

      // 2. 手机号 code
      const phoneCode = e.detail.code

      // 3. 云函数登录
      const res = await wx.cloud.callFunction({
        name: 'wechatPhoneLogin',
        data: { loginCode, phoneCode }
      })

      const { token, user } = res.result
      if (!user) throw new Error('登录失败')

      // 4. 写登录态（openid 作为主身份）
      wx.setStorageSync('token', token)
      wx.setStorageSync('currentStudentId', user.openid)
      wx.setStorageSync('isLoggedIn', true)
      wx.setStorageSync('userInfo', user)

      wx.showToast({ title: '微信登录成功', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 800)

    } catch (err) {
      console.error(err)
      wx.showToast({ title: err.message || '微信登录失败', icon: 'none' })
    } finally {
      this.setData({ wechatLoading: false })
    }
  },

  /* ================== 原有方法 ================== */

  async doLogin(studentId, password) {
    const db = wx.cloud.database()
    const regUsers = wx.getStorageSync('registeredUsers') || []

    // 优先云端校验，保证不同设备可登录
    let userInfo = null
    try {
      const userDoc = await db.collection('users').doc(studentId).get()
      if (!userDoc.data || userDoc.data.password !== password) {
        throw new Error('学号或密码错误')
      }
      userInfo = userDoc.data
    } catch (err) {
      // 云端不存在或无密码字段时，回退到本地注册表（兼容旧数据）
      const user = regUsers.find(u => u.studentId === studentId && u.password === password)
      if (!user) throw new Error('学号或密码错误')

      // 兼容旧用户：如果云端没有记录，则补写一份
      const existed = await db.collection('users').doc(studentId).get().catch(() => null)
      if (!existed || !existed.data) {
        userInfo = {
          studentId,
          nickName: `用户${studentId.slice(-4)}`,
          phone: '',
          creditScore: 100,
          registerTime: new Date().toISOString(),
          lastLoginTime: new Date().toISOString(),
          password
        }
        await db.collection('users').doc(studentId).set({ data: userInfo })
      } else {
        userInfo = existed.data
      }
    }

    wx.setStorageSync('currentStudentId', studentId)
    wx.setStorageSync('isLoggedIn', true)
    wx.setStorageSync('userInfo', userInfo)

    wx.showToast({ title: '登录成功' })
    setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 800)
  },

  async doRegister(studentId, password) {
    const db = wx.cloud.database()
    const regUsers = wx.getStorageSync('registeredUsers') || []

    // 云端判重，保证跨设备唯一
    const existed = await db.collection('users').doc(studentId).get().catch(() => null)
    if ((existed && existed.data) || regUsers.some(u => u.studentId === studentId)) {
      throw new Error('该学号已注册')
    }

    regUsers.push({ studentId, password })
    wx.setStorageSync('registeredUsers', regUsers)

    const userInfo = {
      studentId,
      creditScore: 100,
      registerTime: new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
      password
    }
    await db.collection('users').doc(studentId).set({ data: userInfo })

    wx.setStorageSync('currentStudentId', studentId)
    wx.setStorageSync('isLoggedIn', true)
    wx.setStorageSync('userInfo', userInfo)

    wx.showToast({ title: '注册成功' })
    setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 800)
  }
})
