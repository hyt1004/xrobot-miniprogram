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

// 运行平台相关常量
export const platform = must('platform', process.env.REMAX_PLATFORM)


// TODO: 头条 && 百度 ... platform
export enum Platform {
  Wechat = 'wechat',
  Ali = 'ali'
}

// TODO: 头条 && 百度 ... platform 判断
export const isWechat = platform === Platform.Wechat
export const isAli = platform === Platform.Ali
