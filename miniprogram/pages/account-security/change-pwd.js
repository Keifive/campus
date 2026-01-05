// pages/account-security/change-pwd.js
Page({
  data: {
    oldPwd: '',
    newPwd: '',
    confirmPwd: '',
    canSubmit: false
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [field]: value
    }, () => {
      // 验证是否可以提交
      this.checkSubmitable();
    });
  },

  checkSubmitable() {
    const { oldPwd, newPwd, confirmPwd } = this.data;
    const canSubmit = oldPwd && newPwd && confirmPwd && 
                      newPwd === confirmPwd && 
                      newPwd.length >= 6 && newPwd.length <= 16;
    this.setData({ canSubmit });
  },

  submitForm() {
    const { oldPwd, newPwd } = this.data;
    
    // 模拟密码修改接口调用
    wx.showLoading({ title: '修改中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟接口验证
      if (oldPwd === '123456') { // 实际应调用真实接口验证原密码
        wx.showToast({
          title: '密码修改成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            setTimeout(() => wx.navigateBack(), 1500);
          }
        });
      } else {
        wx.showToast({
          title: '原密码错误',
          icon: 'none'
        });
      }
    }, 1000);
  }
})