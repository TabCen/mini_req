
//// 用户的基本信息 存储
export function setUserInfo(temUserInfo) {
  wx.setStorageSync('userInfo', JSON.stringify(temUserInfo));
}

export function getUserInfo() {
  if (wx.getStorageSync('userInfo')) {
    var userInfo = JSON.parse(wx.getStorageSync('userInfo'));
    return userInfo;
  } else {
    return null;
  }
}

//// token 
export function setToken(token) {
  wx.setStorageSync('token', token);
}

export function getToken() {
  var token = wx.getStorageSync('token');
  return token;
}


//// unionId
export function setUnionId(unionId) {
  wx.setStorageSync('unionId', unionId);
}

export function getUnionId() {
  var unionId = wx.getStorageSync('unionId');
  return unionId;
}
