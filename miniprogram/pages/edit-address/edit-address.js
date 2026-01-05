// pages/edit-address/edit-address.js
const db = wx.cloud.database();

Page({
  data: {
    id: null,
    name: '',
    phone: '',
    area: '',
    detail: '',
    isDefault: false,
    isEdit: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, id: options.id });
      this.loadAddress(options.id);
    }
  },

  /* 加载单条地址 */
  loadAddress(id) {
    db.collection('addresses').doc(id).get()
      .then(res => {
        const { name, phone, area, detail, isDefault } = res.data;
        this.setData({ name, phone, area, detail, isDefault });
      })
      .catch(() => {
        wx.showToast({ title: '地址不存在', icon: 'none' });
      });
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onAreaInput(e) { this.setData({ area: e.detail.value }); },
  onDetailInput(e) { this.setData({ detail: e.detail.value }); },
  onDefaultChange(e) { this.setData({ isDefault: e.detail.value }); },

  /* 保存地址 */
  saveAddress() {
    const { id, name, phone, area, detail, isDefault, isEdit } = this.data;

    if (!name || !phone || !area || !detail) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    /* 获取 openid 后再写库 */
    wx.cloud.callFunction({ name: 'getOpenId' })
      .then(res => {
        const openid = res.result.openid;

        if (isEdit) {
          return db.collection('addresses').doc(id).update({
            data: { name, phone, area, detail, isDefault }
          });
        } else {
          return db.collection('addresses').add({
            data: {
                        // 关键：显式写入
              name,
              phone,
              area,
              detail,
              isDefault,
              createTime: db.serverDate()
            }
          });
        }
      })
      .then(() => this.afterSave(isDefault))
      .catch(err => {
        console.error('保存失败详情：', err);   // 打印完整错误
        wx.hideLoading();
        wx.showToast({ title: '保存失败', icon: 'none' });
    });
    },


  /* 保存后统一处理：如果设为默认，需把其他地址设为非默认 */
  afterSave(isDefault) {
    if (isDefault) {
      db.collection('addresses')
        .where({
          _id: _.neq(this.data.id)
        })
        .update({
          data: { isDefault: false }
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 800);
        })
        .catch(() => {
          wx.hideLoading();
          wx.showToast({ title: '设置默认地址失败', icon: 'none' });
        });
    } else {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    }
  }
});