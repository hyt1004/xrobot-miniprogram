/* eslint-disable no-console */
import { fetch, FetchOptions } from "../../utils/fetchs";
import { isNotNull } from "./utils";
import store from "../../stores/agent/index";
import { showToast as wxShowToast } from "remax/wechat";

// 显示错误信息
function showToast(msg: string, duration?: number) {
  wxShowToast({
    title: msg,
    icon: "none", // 该toast带有icon时最多显示 7 个汉字长度
    duration: duration ?? 3000,
  });
}

/**
 * Request服务封装
 */
export default {
  sendRequest,
  reAjaxFun,
  clearRequestTime,
};

function sendRequest() {
  return {
    _sucCallback: null,
    _failCallback: null,
    _networkFailCallback: null,
    _method: "GET",
    _data: {},
    _header: { "content-type": "application/json; charset=utf-8" },
    _url: "",
    _responseType: undefined, // 新增响应类型字段
    send() {
      if (isNotNull(store.getToken())) {
        this._header.Authorization =
          "Bearer " + JSON.parse(store.getToken()).token;
      }

      // 构造请求选项
      const options: FetchOptions = {
        data: this._data,
        method: this._method,
        headers: this._header,
        responseType: this._responseType,
        dataType: "json",
        timeout: 30000,
      } as FetchOptions;

      //   请求
      fetch(this._url, options)
        .then((res) => {
          const error = httpHandlerError(
            res,
            this._failCallback,
            this._networkFailCallback
          );
          if (error) {
            return;
          }

          if (this._sucCallback) {
            this._sucCallback(res);
          }
        })
        .catch((res) => {
          // 打印失败响应
          console.log("catch", res);
          httpHandlerError(res, this._failCallback, this._networkFailCallback);
        });
      return this;
    },
    success(callback) {
      this._sucCallback = callback;
      return this;
    },
    fail(callback) {
      this._failCallback = callback;
      return this;
    },
    networkFail(callback) {
      this._networkFailCallback = callback;
      return this;
    },
    url(url) {
      if (url) {
        url = url.replaceAll("$", "/");
      }
      this._url = url;
      return this;
    },
    data(data) {
      this._data = data;
      return this;
    },
    method(method) {
      this._method = method;
      return this;
    },
    header(header) {
      this._header = header;
      return this;
    },
    showLoading(showLoading) {
      this._showLoading = showLoading;
      return this;
    },
    async(flag) {
      this.async = flag;
    },
    // 新增类型设置方法
    type(responseType) {
      this._responseType = responseType;
      return this;
    },
  };
}

/**
 * Info 请求完成后返回信息
 * failCallback 回调函数
 * networkFailCallback 回调函数
 */
// 在错误处理函数中添加日志
function httpHandlerError(info, failCallback, networkFailCallback) {
  /** 请求成功，退出该函数 可以根据项目需求来判断是否请求成功。这里判断的是status为200的时候是成功 */
  let networkError = false;
  if (info.status === 200) {
    if (
      info.data.code === "success" ||
      info.data.code === 0 ||
      info.data.code === undefined
    ) {
      return networkError;
    } else if (info.data.code === 401) {
      store.commit("clearAuth");
      //   TODO 转到登陆页
      //   navigateTo()
      return true;
    } else {
      if (failCallback) {
        failCallback(info);
      } else {
        showToast(`网络请求出现了错误【${info.data.msg}】`);
      }
      return true;
    }
  }
  if (networkFailCallback) {
    networkFailCallback(info);
  } else {
    showToast(`网络请求出现了错误【${info.status}】`);
  }
  return true;
}

let requestTime = 0;
let reAjaxSec = 2;

function reAjaxFun(fn) {
  let nowTimeSec = new Date().getTime() / 1000;
  if (requestTime === 0) {
    requestTime = nowTimeSec;
  }
  let ajaxIndex = parseInt((nowTimeSec - requestTime) / reAjaxSec);
  if (ajaxIndex > 10) {
    showToast("似乎无法连接服务器", 1000);
  } else {
    showToast("正在连接服务器(" + ajaxIndex + ")", 1000);
  }
  if (ajaxIndex < 10 && fn) {
    setTimeout(() => {
      fn();
    }, reAjaxSec * 1000);
  }
}

function clearRequestTime() {
  requestTime = 0;
}
