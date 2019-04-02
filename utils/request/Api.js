
var urlconfig = require('./Urlconfig.js');
var util = require('./md5.js');
var ds = require('./../DataStorage.js');

class Api {
  constructor(header, data = null, contenttype = "application/json") {
    ///初始化方法
    this.header = header;
    this.data = data;
    this.contenttype = contenttype;
    this.promise = null;
  }

  /**
   * 网络请求 外部调用方法 
   * 1、拼接URL
   * 2、生成 Promise 立即请求
   */
  request(withFilter = true) {

    var url = this.urlPreProcessing();
    this.promise = this.fire(url, this.header.method, this.data, this.contenttype, withFilter);
    return this.promise;
  }

  /**
   * 拼接URL默认参数 根据公司的校验逻辑各自发挥
   */
  urlPreProcessing() {
    //获取userInfo
    var userInfo = ds.getUserInfo();
    var unionId = ds.getUnionId();
    ///获取token
    var token = '?token=' + ds.getToken();
    var extend = '';
    if (userInfo != null) {
      var md5str = util.hexMD5(unionId + timestamp);

      extend = '&user_id=' + (userInfo.userId == undefined ? 'null' : userInfo.userId) + '&sign=' + util.hexMD5(unionId)
    } else {
      extend = '&user_id=null&sign=' + util.hexMD5("null")
    }
    var extendparam = token + extend
    return urlconfig.BASEURL + this.header.url + extendparam;
  }

  /**
   * 请求发出fire调用后请求直接被发出
   */
  fire(url, method, data, contenttype, withFilter) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: url,
        method: method,
        data: data,
        header: {
          'content-type': contenttype // 默认值
        },
        success: function (res) {
          ///是否对结果进行过滤 校验token是否失效
          if (withFilter) {
            //过滤token失效情况
            if (that.filtResponse(res, resolve)) {
              resolve(res);
            }
          } else {
            resolve(res);
          }
        },
        fail: function (err) {
          console.log(err);
          reject(err);
          wx.showToast({
            title: '网络链接失败',
          })
        },
        complete: function () {
          // console.log("网络请求结束后");
        }
      })
    });
  }

  /**
   * 过滤请求返回bool 过滤是否code 在1～10以内
   */
  filtResponse(res, resolve) {
    var that = this;

    ///token失效 
    if (res.data.code == 1 || res.data.code == 3) {
      console.log("token失效，需重新获取");
      request_getToken(function () {
        ///这里不再做过滤操作，防止发生循环请求
        that.request(false).then((successRes) => {
          resolve(successRes);
        });
      })
      return false;
    }
    return true;
  }

  showDescription() {
    console.log(this.header);
  }
}

////请求获取 token
function request_getToken(callBack) {
  wx.login({
    success(res) {
      if (res.code) {
        console.log("登录成功");
        var task = new Api(urlconfig.GETTOKEN, {
          code: res.code
        });
        task.request(false).then((res) => {
          console.log(res);
          if (res.data.success == true) {
            ds.setToken(res.data.data.token);
            console.log("重新获取token成功 code换取toke 保存成功");
            callBack(res);
          } else {
            wx.showToast({
              title: res.data.errMsg,
              duration: 2000
            });
          }
        }).catch((err) => {
          console.log(err);
        });
      } else {
        console.log('登录失败！' + res.errMsg)
        wx.showToast({
          title: res.errMsg,
          duration: 2000
        });
      }
    }
  })
}

export default Api;
