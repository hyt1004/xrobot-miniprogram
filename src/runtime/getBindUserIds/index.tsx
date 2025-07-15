/**
 * @file getBindUids runtime(wechat version)
 */

import { login as wechatLogin } from 'remax/wechat'

import { fetchWithCommonRes } from '../../utils/fetchs/fetchWithCommonRes'
import { promisify } from '../../utils/promise'
import { ucBizApiPrefix } from '../../constants/api'

export type UserId = {
  uid: number
  /** userId 是不同于 uid 的用户唯一标识 */
  userId: string
  fullName: string
  email: string
}

/** 获取当前微信号绑定的 userId 列表 */
export default function getBindUserIds(): Promise<UserId[]> {
  return promisify(wechatLogin)()
    .then(({ code, errMsg }: WechatMiniprogram.LoginSuccessCallbackResult) => {
      if (code) {
        return fetchWithCommonRes(`${ucBizApiPrefix}/wx/mini-program/bind/uids?wx_code=${code}`) as Promise<{
          count: number
          // eslint-disable-next-line camelcase
          users: Array<{ uid: number, user_id: string, fullname: string, email: string }>
        }>
      }

      return Promise.reject(errMsg)
    })
    .then(({ count, users }) => {
      if (count === 0) {
        return []
      }

      return users.map(user => ({
        uid: user.uid,
        userId: user.user_id,
        fullName: user.fullname,
        email: user.email
      }))
    })
}
