/**
 * @file signin-type 相关
 * @description 登录类型
 */

export enum SigninType {
  Email = 1,
  Mobile = 2,
  WeChat = 3
}

export const signinTypeTextMap = {
  [SigninType.Email]: '邮箱登录',
  [SigninType.Mobile]: '手机号登录',
  [SigninType.WeChat]: '微信登录'
}
