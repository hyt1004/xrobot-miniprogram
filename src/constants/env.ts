/**
 * @file 配置的环境变量，具体值见 .env & .env.<enviroment> 文件
 * @description 相关文档 https://remaxjs.org/guide/config/environment-variables
 */

function must(name: string, variable?: string): string {
  if (variable == null) {
    throw new Error(`Invalid value for environment variable ${name}, you need to configure it in env file`)
  }
  return variable
}

// Host
// host 用于赋值给 request header 中的 Origin 字段
// 避免请求到 janus 或者老官网时被拦截
// .env.development && .env.production 中配置的 REMAX_APP_HOST 域名是不可访问的
// 只是为了通过 janus && 老官网的校验逻辑
export const host = must('host', process.env.REMAX_APP_HOST)

// API Host
export const apiHost = must('apiHost', process.env.REMAX_APP_API_HOST)

// SSO Host
export const ssoHost = must('ssoHost', process.env.REMAX_APP_SSO_HOST)

// 运行平台相关常量
export const platform = must('platform', process.env.REMAX_PLATFORM)

export const publicAssetHost = must('publicAssetHost', process.env.REMAX_APP_PUBLIC_ASSET_HOST)

// 工单小程序 appID（目前只有微信小程序）
export const supportMpAppID = must('supportMpAppID', process.env.REMAX_APP_SUPPORT_MP_APP_ID)

// TODO: 头条 && 百度 ... platform
export enum Platform {
  Wechat = 'wechat',
  Ali = 'ali'
}

// TODO: 头条 && 百度 ... platform 判断
export const isWechat = platform === Platform.Wechat
export const isAli = platform === Platform.Ali

// 信任的小程序app id 列表，可以携带重要数据比如说cookie
export const appIDWhiteList = must('appIDWhiteList', process.env.REMAX_APP_WECHAT_APP_ID_WHITE_LIST).split(',')

export const portalHost = must('portalHost', process.env.REMAX_APP_PORTAL_HOST)
export const marketingHost = must('marketingHost', process.env.REMAX_APP_MARKETING_HOST)
export const cloudMarketUrl = must('cloudMarketUrl', process.env.REMAX_APP_CLOUD_MARKET_URL)
