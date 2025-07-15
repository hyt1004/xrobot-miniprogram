/**
 * @file signin runtime(wechat version)
 */

import { login as wechatLogin } from 'remax/wechat'

import * as sensors from '../../utils/sensors'
import * as datanexus from '../../utils/datanexus'
import { promisify } from '../../utils/promise'
import { postJSONWithCommonRes } from '../../utils/fetchs/fetchWithCommonRes'
import { ssoApiPrefix } from '../../constants/api'
import { ssoErrCodeMsgMap, ucBizErrCodeMsgMap } from '../../constants/error-code-messages'
import { SigninType } from '../../constants/signin-type'
import rsaEncrypt from '../../utils/rsaEncrypt'
import { reportLogin } from '../../utils/wx-report'

type SigninOptionsBase = {
  /** 登录类型（登录会自动绑定当前微信用户的 unionId）
   * - 1: 邮箱密码登录；
   * - 2: userID + 密码；（暂时不用，忽略）
   * - 3: 微信登录
   */
  signinType: SigninType

  /**
   * userName
   * - signinType === Eamil 时，userName 传邮箱
   * - signinType === Wechat 时，userName 传 userId
   */
  username: string

  /** 可选，需要时必填，图形验证码 */
  captcha?: string

  /** 可选，扫码登录和扫码注册场景（会同时登录 Portal，更新二维码状态） */
  qrKey?: string
}

type SigninEmailOptions = SigninOptionsBase & {
  signinType: SigninType.Email
  password: string
}

type SigninUserIdOptions = SigninOptionsBase & {
  signinType: SigninType.WeChat
}

/** 登录七牛账号，登录后会绑定到当前微信账号 unionId */
function signin(options: SigninEmailOptions | SigninUserIdOptions) {
  return promisify(wechatLogin)().then(({ code, errMsg }: WechatMiniprogram.LoginSuccessCallbackResult) => {
    if (code) {
      const reqOptions: any = {
        sign_in_type: options.signinType,
        wx_code: code,
        username: options.username,
        captcha: options.captcha,
        qr_key: options.qrKey
      }
      if (options.signinType === SigninType.Email) {
        reqOptions.password = options.password
      }
      return postJSONWithCommonRes(
        `${ssoApiPrefix}/signin/wx`,
        reqOptions,
        { errCodeMsgMap: { ...ssoErrCodeMsgMap, ...ucBizErrCodeMsgMap } }
      ).then(
        res => {
          sensors.signinTracker({ qrKey: options.qrKey, isSigninSuccess: true })
          datanexus.loginTrack()
          reportLogin()
          return Promise.resolve(res)
        },
        err => {
          sensors.signinTracker({ qrKey: options.qrKey, isSigninSuccess: false })
          return Promise.reject(err)
        }
      )
    }

    return Promise.reject(errMsg)
  })
}

/**
 * 微信登录：通过微信账号已绑定的 userId 和 wx code 登录，主要用于微信登录、静默登录和扫登录码授权登录 Portal。
 * - userId 是不同于 uid 的用户唯一标识，overview 接口可以拿到，signup 接口会同时返回 uid 和 user_id；
 * - qrKey 为扫登录码或注册码场景，会同时登录微信小程序和授权 Portal 登录；
 */
export function signinWithUserId(userId: string, qrKey?: string) {
  return signin({
    signinType: SigninType.WeChat,
    username: userId,
    qrKey
  })
}

/** 邮箱账号密码登录；qrKey 为扫登录码或注册码场景，会同时登录微信小程序和授权 Portal 登录； */
export async function signinWithEmail(options: {
  username: string
  password: string
  captcha?: string
  qrKey?: string
}) {
  try {
    options.password = await rsaEncrypt(options.password)
  } catch (error) {
    return Promise.reject(error)
  }
  return signin({
    signinType: SigninType.Email,
    ...options
  })
}

export type SigninWithPhoneOptions = {
  /** 根据授权手机号查询账号列表返回的登录凭证 */
  token: string
  /** 在手机号绑定的账号列表里选中的账号 ID */
  account_id: string
  /** 可选，扫码登录和扫码注册场景（会同时登录 Portal，更新二维码状态） */
  qr_key?: string
}

/** 手机号快捷登录绑定账号 */
export function signinWithPhone(options: SigninWithPhoneOptions) {
  return postJSONWithCommonRes(
    `${ssoApiPrefix}/signin/phone/authorize`,
    options,
    { errCodeMsgMap: { ...ssoErrCodeMsgMap, ...ucBizErrCodeMsgMap } }
  ).then(
    res => {
      sensors.signinTracker({ qrKey: options.qr_key, isSigninSuccess: true })
      datanexus.loginTrack()
      reportLogin()
      return Promise.resolve(res)
    },
    err => {
      sensors.signinTracker({ qrKey: options.qr_key, isSigninSuccess: false })
      return Promise.reject(err)
    }
  )
}
