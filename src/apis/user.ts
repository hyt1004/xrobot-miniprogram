/**
 * @file user api
 */

import { fetchWithCommonRes, postJSONWithCommonRes } from '../utils/fetchs/fetchWithCommonRes'
import { fetch } from '../utils/fetchs'

import { ucBizApiPrefix, ssoApiPrefix, gaeaApiPrefix, portalGaeaApiPrefix } from '../constants/api'
import { IdentityStatus, IdentityType, IdentityStep } from '../constants/identity'
import { SigninType } from '../constants/signin-type'
import { ssoErrCodeMsgMap, gaeaErrCodeMsgMap, ucBizErrCodeMsgMap } from '../constants/error-code-messages'
import { CurrencyType } from '../constants/currency'
import { ContractingBody } from '../constants/contracting-body'
import Desensitization from '../utils/transforms/desensitization'

export type SigninOptions = {
  username: string
  password: string
  signinType: SigninType
  captcha?: string
}

export type QiniuUserInfo = {
  account_id: string
  uid: number
  fullName: string
  customerEmail: string
  phoneNumber: string
  signupTime: string
  parentUID: number
  isFreezed: boolean
  isCertified: boolean
  freezeType: number
  freezeTime: string
  freezeReason: string
  identityStatus: IdentityStatus
  identityType: IdentityType
  identityStep: IdentityStep
  identityTime: string
  salesEmail: string
  isActivated: boolean
  currency_type: CurrencyType
  isOverseasUser: boolean
  contractingBody: ContractingBody
  isEnterprise: boolean
  merge_account_info: any
}

export type GetGaeaCaptchaRes = {
  type: number,
  data: string
}

export type ResendActiveEmailOptions = {
  email: string
}

export type GetLoginTicketRes = {
  ticketId: string
}

// 七牛 sso 登出
export function ssoLogut(): Promise<unknown> {
  return fetchWithCommonRes(`${ssoApiPrefix}/signout?no_redirect=true`, {
    errCodeMsgMap: ssoErrCodeMsgMap
  })
}

// 获取用户信息
export async function getQiniuUserInfo(): Promise<QiniuUserInfo> {
  // 将overview接口改成了portal-gaea的overview接口，有些字段名不同，修改映射
  const {
    account_id,
    is_enterprise_user: isEnterprise,
    contracting_body: contractingBody,
    is_overseas_user: isOverseasUser,
    email: customerEmail,
    // 后端未打码，前端打码处理
    mobile,
    signup_time: signupTime,
    parent_uid: parentUID,
    is_freezed: isFreezed,
    is_certified: isCertified,
    disabled_type: freezeType,
    disabled_at: freezeTime,
    disabled_reason: freezeReason,
    identity_status: identityStatus,
    identity_type: identityType,
    identity_step: identityStep,
    identity_time: identityTime,
    salers_info: salesInfo,
    is_activated: isActivated,
    currency_type,
    full_name: fullName,
    ...others
  } = await fetchWithCommonRes(`${portalGaeaApiPrefix}/api/gaea/user/overview`)

  return {
    account_id,
    customerEmail,
    phoneNumber: Desensitization.Mobile(mobile),
    signupTime,
    parentUID,
    isFreezed,
    isCertified,
    freezeType,
    freezeTime,
    freezeReason,
    identityStatus,
    identityType,
    identityStep,
    identityTime,
    salesEmail: salesInfo.email,
    isActivated,
    currency_type,
    isOverseasUser,
    contractingBody,
    isEnterprise,
    fullName: fullName || customerEmail.slice(0, 4),
    ...others
  }
}

// 获取 sso 登录图片验证码
export function getSSOCaptcha(username: string): Promise<string> {
  return fetchWithCommonRes(`${ssoApiPrefix}/captcha?key=${encodeURIComponent(username)}`, {
    errCodeMsgMap: ssoErrCodeMsgMap
  })
}

// 获取注册绑定手机图片验证码
export function getGaeaCaptcha(key: string): Promise<GetGaeaCaptchaRes> {
  return fetchWithCommonRes(`${gaeaApiPrefix}/api/verification/captcha/image?key=${encodeURIComponent(key)}`, {
    errCodeMsgMap: gaeaErrCodeMsgMap
  })
}

// 重发验证邮件
export function resendActiveEmail(options: ResendActiveEmailOptions): Promise<unknown> {
  return postJSONWithCommonRes(`${gaeaApiPrefix}/api/developer/signup/email/resend`, options, {
    errCodeMsgMap: gaeaErrCodeMsgMap
  })
}

export enum DuplicateType {
  /** 不重复 */
  None = 0,
  /** 邮箱重复 */
  Email = 1,
  /** 手机重复 */
  Phone = 2,
  /** 邮箱和手机重复 */
  EmailPhone = 3
}

/** 账号重复性检查 */
export async function duplicateCheck(
  { email, phoneNumber }: { email?: string, phoneNumber?: string }
): Promise<DuplicateType> {
  const { duplicate_type: duplicateType } = await fetchWithCommonRes(`${ucBizApiPrefix}/user/duplicate/check`, {
    data: { email, phone_number: phoneNumber },
    errCodeMsgMap: ucBizErrCodeMsgMap
  })

  return duplicateType as DuplicateType
}

/** 获取ticket_id用于ticket登录 */
export async function getLoginTicket(): Promise<GetLoginTicketRes> {
  try {
    const { ticket_id: ticketId } = await fetch(`${ssoApiPrefix}/login-ticket?ticket_login_type=vforkTicket`, {
      errCodeMsgMap: ssoErrCodeMsgMap
    })

    return { ticketId }
  } catch (error) {
    return Promise.reject(error)
  }
}

/** 给绑定的手机号发送验证码 */
export async function sendMobileVerifyCode() {
  return fetchWithCommonRes(`${ssoApiPrefix}/api/mobile/captcha`, {
    method: 'POST',
    errCodeMsgMap: ssoErrCodeMsgMap
  })
}

/** 安全合规验证 */
export function complianceVerification(captcha: string) {
  return fetchWithCommonRes(`${ssoApiPrefix}/api/compliance-verification`, {
    method: 'POST',
    data: { captcha },
    errCodeMsgMap: ssoErrCodeMsgMap
  })
}
