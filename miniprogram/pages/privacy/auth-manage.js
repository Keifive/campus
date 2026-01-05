//pages/privacy/auth-manage.js
Page({
  data: {
    authList: [
      { type: 'userInfo', name: '昵称头像', checked: false, disabled: false },
      { type: 'location', name: '位置信息', checked: false, disabled: false },
      { type: 'phoneNumber', name: '手机号码', checked: false, disabled: false }
    ]
  },
// 同步微信实际授权状态
  onShow() {
    this.syncAuthStatus(); 
  },

  // 同步微信授权状态到页面
  async syncAuthStatus() {
    const authList = this.data.authList;
    const setting = await wx.getSetting(); // 获取微信授权设置

    authList.forEach(item => {
      // 微信授权字段映射（如scope.userInfo对应userInfo）
      const scopeKey = `scope.${item.type === 'userInfo' ? 'userInfo' : item.type}`;
      item.checked = !!setting.authSetting[scopeKey];
    });

    this.setData({ authList });
  },

  // 切换授权状态
  async handleAuthChange(e) {
    const { type } = e.currentTarget.dataset;
    const isChecked = e.detail.value;

    try {
      if (isChecked) {
        // 申请授权（不同权限调用不同API）
        if (type === 'userInfo') {
          await wx.getUserProfile({ desc: '用于展示个人信息' });
        } else if (type === 'location') {
          await wx.getLocation({ type: 'wgs84' });
        } else if (type === 'phoneNumber') {
          // 手机号授权需按钮触发，这里仅做状态同步提示
          wx.showToast({ title: '请在个人中心重新绑定手机号', icon: 'none' });
          return;
        }
      } else {
        // 取消授权（微信不支持主动取消，仅提示用户去设置页操作）
        wx.showModal({
          title: '提示',
          content: '请在微信设置中取消授权',
          confirmText: '去设置',
          success: res => {
            if (res.confirm) wx.openSetting();
          }
        });
        return;
      }

      // 同步状态到后端
      await wx.request({
        url: '/api/user/updateAuth',
        method: 'POST',
        data: { [type]: isChecked },
        header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` }
      });

      this.syncAuthStatus(); // 重新同步状态
    } catch (err) {
      console.error('授权失败', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});