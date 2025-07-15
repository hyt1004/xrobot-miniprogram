/**
 * @file userID store(ali version)
 * @description 用于存放需要存储在支付宝小程序 storage 里面的一些信息，包括 openID、reqCookie 等
 */

import { getStorageSync, setStorageSync } from 'remax/ali'

import { thirdPartyLogin } from '../../runtime'

import { transformCookieToWeb } from '../../utils/transforms'

const storageKeyPrefix = 'userID'

enum UserIDStorageKey {
  OpenID = 'openID',
  ReqCookie = 'reqCookie'
}

export class UserIDStore {
  async getOpenID() {
    const { data: openID } = getStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`
    })

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

    setStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`,
      data: openID
    })
  }

  clearOpenID() {
    setStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.OpenID}`,
      data: ''
    })
  }

  get reqCookie(): string {
    const { data: cookie } = getStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`
    })

    return cookie as string || ''
  }

  updateReqCookie(cookie: string) {
    if (!cookie) return

    const trasformedCookie = transformCookieToWeb(cookie)

    if (!trasformedCookie) return

    setStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`,
      data: trasformedCookie
    })
  }

  clearReqCookie() {
    setStorageSync({
      key: `${storageKeyPrefix}.${UserIDStorageKey.ReqCookie}`,
      data: ''
    })
  }
}

export default new UserIDStore()
