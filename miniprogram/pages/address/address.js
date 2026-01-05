// pages/address/address.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressList: [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        area: '广东省汕头市金平区',
        detail: '汕头大学学生公寓1栋101室',
        isDefault: true
      },
      {
        id: 2,
        name: '张三',
        phone: '13800138000',
        area: '广东省汕头市金平区',
        detail: '汕头大学第二食堂快递点',
        isDefault: false
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadAddressList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadAddressList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadAddressList();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载地址列表
   */
  loadAddressList() {
    wx.showLoading({ title: '加载中...' });
  
    const db = wx.cloud.database();
    db.collection('addresses')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        const list = res.data.map(item => ({
          id: item._id,
          name: item.name,
          phone: item.phone,
          area: item.area,
          detail: item.detail,
          isDefault: item.isDefault
        }));
        this.setData({ addressList: list });
        wx.setStorageSync('userAddresses', list); // 可选：同步缓存
      })
      .catch(err => {
        console.error('拉取地址失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 选择地址
   */
  selectAddress(e) {
    const index = e.currentTarget.dataset.index;
    const address = this.data.addressList[index];
    
    // 如果是从其他页面跳转过来选择地址，则返回选择结果
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage && prevPage.selectAddress) {
      prevPage.selectAddress(address);
      wx.navigateBack();
    }
  },

  /**
   * 添加新地址
   */
  addNewAddress() {
    wx.navigateTo({
      url: '/pages/edit-address/edit-address',
    });
  },

  /**
   * 编辑地址
   */
  editAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit-address/edit-address?id=${id}`,
    });
  },

  /**
   * 删除地址
   */
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteAddress(id);
        }
      }
    });
  },

  /**
   * 确认删除地址
   */
  confirmDeleteAddress(id) {
    wx.showLoading({
      title: '删除中...',
    });
    
    setTimeout(() => {
      // 过滤掉要删除的地址
      const newList = this.data.addressList.filter(item => item.id !== id);
      
      // 如果删除的是默认地址，且还有其他地址，设置第一个为默认
      const deletedItem = this.data.addressList.find(item => item.id === id);
      if (deletedItem && deletedItem.isDefault && newList.length > 0) {
        newList[0].isDefault = true;
      }
      
      this.setData({ addressList: newList });
      
      // 保存到本地存储
      wx.setStorageSync('userAddresses', newList);
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 800);
  },

  /**
   * 设为默认地址
   */
  setDefaultAddress(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showLoading({
      title: '设置中...',
    });
    
    setTimeout(() => {
      // 更新地址列表
      const newList = this.data.addressList.map(item => ({
        ...item,
        isDefault: item.id === id
      }));
      
      this.setData({ addressList: newList });
      
      // 保存到本地存储
      wx.setStorageSync('userAddresses', newList);
      
      wx.hideLoading();
      wx.showToast({
        title: '已设为默认地址',
        icon: 'success'
      });
    }, 600);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '校园代取-地址管理',
      path: '/pages/address/address'
    };
  }
});