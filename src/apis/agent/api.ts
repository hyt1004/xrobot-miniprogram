// 引入各个模块的请求
import admin from "./module/admin";
import agent from "./module/agent";
import device from "./module/device";
import dict from "./module/dict";
import model from "./module/model";
import ota from "./module/ota";
import timbre from "./module/timbre";
import user from "./module/user";

/**
 * 接口地址
 */
const DEV_API_SERVICE = "/xiaozhi"

/**
 * 服务端域名
 */
const SERVER_DOMAIN = "xrobo.qiniu.com"

/**
 * 返回接口url
 * @returns {string}
 */
export function getServiceUrl() {
  return SERVER_DOMAIN + DEV_API_SERVICE;
}

/** request服务封装 */
export default {
  getServiceUrl,
  user,
  admin,
  agent,
  device,
  model,
  timbre,
  ota,
  dict,
};
