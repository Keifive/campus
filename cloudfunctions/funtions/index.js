const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 获取数据库实例
const db = cloud.database();

/**
 * 获取用户openid及相关信息
 */
const getOpenId = async () => {
  try {
    // 获取基础信息
    const wxContext = cloud.getWXContext();
    return {
      success: true,
      data: {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
      }
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '获取openid失败',
      error: error
    };
  }
};

/**
 * 微信一键登录：返回 userInfo（头像昵称来自前端 profile）
 */
const loginByWechat = async (event) => {
  try {
    const ctx = cloud.getWXContext();
    const openid = ctx.OPENID;
    if (!openid) {
      return { success: false, errMsg: '获取 openid 失败' };
    }

    const profile = event.profile || {};
    const now = new Date().toISOString();

    const userDoc = await db.collection('users').doc(openid).get().catch(() => null);
    const baseInfo = {
      studentId: openid,
      id: openid,
      nickName: profile.nickName || userDoc?.data?.nickName || '微信用户',
      avatarUrl: profile.avatarUrl || userDoc?.data?.avatarUrl || '',
      phone: userDoc?.data?.phone || '',
      creditScore: userDoc?.data?.creditScore || 100,
      registerTime: userDoc?.data?.registerTime || now,
      lastLoginTime: now,
      from: 'wechat'
    };

    if (userDoc?.data) {
      await db.collection('users').doc(openid).update({ data: baseInfo });
    } else {
      await db.collection('users').doc(openid).set({ data: baseInfo });
    }

    return { success: true, data: { userInfo: baseInfo, openid } };
  } catch (error) {
    return { success: false, errMsg: 'loginByWechat 失败', error };
  }
};

/**
 * 获取小程序二维码
 */
const getMiniProgramCode = async () => {
  try {
    // 获取小程序二维码的buffer
    const resp = await cloud.openapi.wxacode.get({
      path: "pages/index/index",
      width: 280, // 二维码宽度
    });
    const { buffer } = resp;
    
    // 将图片上传云存储空间
    const uploadResult = await cloud.uploadFile({
      cloudPath: `qrcodes/code_${Date.now()}.png`, // 使用时间戳避免重复
      fileContent: buffer,
    });
    
    return {
      success: true,
      data: {
        fileID: uploadResult.fileID,
        cloudPath: uploadResult.cloudPath
      }
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '生成小程序二维码失败',
      error: error
    };
  }
};

/**
 * 创建数据集合并初始化示例数据
 */
const createCollection = async () => {
  try {
    // 检查集合是否已存在，如果已存在则直接添加示例数据
    const collections = await db.listCollections();
    const collectionExists = collections.collections.some(col => col.name === 'sales');
    
    if (collectionExists) {
      // 集合已存在，直接添加示例数据
      await addSampleSalesData();
      return {
        success: true,
        data: '集合已存在，示例数据添加成功'
      };
    } else {
      // 集合不存在，先创建集合再添加数据
      await db.createCollection("sales");
      await addSampleSalesData();
      return {
        success: true,
        data: '集合创建成功并添加示例数据'
      };
    }
  } catch (error) {
    return {
      success: false,
      errMsg: '创建集合失败',
      error: error
    };
  }
};

/**
 * 添加销售示例数据
 */
const addSampleSalesData = async () => {
  const sampleData = [
    { region: "华东", city: "上海", sales: 11 },
    { region: "华东", city: "南京", sales: 11 },
    { region: "华南", city: "广州", sales: 22 },
    { region: "华南", city: "深圳", sales: 22 },
  ];

  for (const data of sampleData) {
    await db.collection("sales").add({
      data: data
    });
  }
};

/**
 * 查询销售记录
 */
const selectRecord = async () => {
  try {
    const result = await db.collection("sales").get();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '查询数据失败',
      error: error
    };
  }
};

/**
 * 更新销售记录
 */
const updateRecord = async (event) => {
  try {
    if (!event.data || !Array.isArray(event.data) || event.data.length === 0) {
      return {
        success: false,
        errMsg: '更新数据格式不正确'
      };
    }

    const updateResults = [];
    
    for (let i = 0; i < event.data.length; i++) {
      const updateItem = event.data[i];
      
      if (!updateItem._id || updateItem.sales === undefined) {
        continue; // 跳过无效数据
      }

      const result = await db
        .collection("sales")
        .where({
          _id: updateItem._id,
        })
        .update({
          data: {
            sales: Number(updateItem.sales),
            updateTime: new Date() // 添加更新时间
          },
        });
      
      updateResults.push({
        _id: updateItem._id,
        updated: result.stats.updated > 0,
        sales: updateItem.sales
      });
    }

    return {
      success: true,
      data: updateResults
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '更新数据失败',
      error: error
    };
  }
};

/**
 * 新增销售记录
 */
const insertRecord = async (event) => {
  try {
    if (!event.data || !event.data.region || !event.data.city || event.data.sales === undefined) {
      return {
        success: false,
        errMsg: '新增数据格式不正确'
      };
    }

    const insertData = {
      region: event.data.region,
      city: event.data.city,
      sales: Number(event.data.sales),
      createTime: new Date(),
      updateTime: new Date()
    };

    const result = await db.collection("sales").add({
      data: insertData
    });

    return {
      success: true,
      data: {
        ...insertData,
        _id: result._id
      }
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '新增数据失败',
      error: error
    };
  }
};

/**
 * 删除销售记录
 */
const deleteRecord = async (event) => {
  try {
    if (!event.data || !event.data._id) {
      return {
        success: false,
        errMsg: '删除数据格式不正确'
      };
    }

    const result = await db
      .collection("sales")
      .where({
        _id: event.data._id,
      })
      .remove();

    return {
      success: true,
      data: {
        deleted: result.stats.removed > 0,
        _id: event.data._id
      }
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '删除数据失败',
      error: error
    };
  }
};

/**
 * 获取用户任务相关数据（从app.js需求中提取）
 */
const getUserTasks = async (event) => {
  try {
    const { studentId } = event;
    if (!studentId) {
      return {
        success: false,
        errMsg: '缺少studentId参数'
      };
    }

    const tasksKey = `tasks_${studentId}`;
    const tasks = wx.getStorageSync(tasksKey);
    
    if (!tasks) {
      return {
        success: true,
        data: {
          published: [],
          accepted: [],
          completed: [],
          favorites: []
        }
      };
    }

    return {
      success: true,
      data: tasks
    };
  } catch (error) {
    return {
      success: false,
      errMsg: '获取用户任务失败',
      error: error
    };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('云函数调用:', event);
  
  const { type, data } = event;
  
  switch (type) {
    case "getOpenId":
      return await getOpenId();
    case "loginByWechat":
      return await loginByWechat(event);
      
    case "getMiniProgramCode":
      return await getMiniProgramCode();
      
    case "createCollection":
      return await createCollection();
      
    case "selectRecord":
      return await selectRecord();
      
    case "updateRecord":
      return await updateRecord(data);
      
    case "insertRecord":
      return await insertRecord(data);
      
    case "deleteRecord":
      return await deleteRecord(data);
      
    case "getUserTasks":
      return await getUserTasks(data);
      
    default:
      return {
        success: false,
        errMsg: '未知的操作类型',
        type: type
      };
  }
};
