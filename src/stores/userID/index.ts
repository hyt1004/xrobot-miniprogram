/**
 * @file userID store(wechat version)
 * @description 用于存放需要存储在微信小程序 storage 里面的一些信息，包括 openID、reqCookie 等
 */

import { getStorageSync, setStorageSync } from 'remax/wechat'

import { thirdPartyLogin } from '../../runtime'

import { combineCookie, transformCookieToWeb } from '../../utils/transforms'

const storageKeyPrefix = 'userID'

enum UserIDStorageKey {
  OpenID = 'openID',
  ReqCookie = 'reqCookie'
}

export class UserIDStore {
  async getOpenID() {
    const openID = getStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`
    )

    if (openID) return openID

    const { open_id: resOpenID } = await thirdPartyLogin()
    if (resOpenID) {
      this.updateOpenID(resOpenID)
      return resOpenID
    }

    return ''
  }

  updateOpenID(openID: string) {
    if (!openID) return

    setStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`,
      openID
    )
  }

  clearOpenID() {
    setStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`,
      undefined
    )
  }

  get reqCookie(): string {
    const cookie = getStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`
    )

    return cookie || ''
  }

  updateReqCookie(cookie: string) {
    if (!cookie) return

    const trasformedCookie = transformCookieToWeb(cookie)

    if (!trasformedCookie) return

    const oldCookie = getStorageSync(`${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`)

    const newCookie = combineCookie(oldCookie, trasformedCookie)

    setStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`,
      newCookie
    )
  }

  clearReqCookie() {
    setStorageSync(
      `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`,
      undefined
    )
  }
}

export default new UserIDStore()
