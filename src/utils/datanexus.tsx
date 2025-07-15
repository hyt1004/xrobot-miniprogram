/**
 * @description 腾讯广告 DataNexus 小程序 SDK 初始化
 * https://datanexus.qq.com/doc/develop/guider/sdk/miniprogram/init
 */
import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import { SDK } from '@dn-sdk/miniprogram'

import userIDStore from '../stores/userID'

export interface DnSdkContextValue {
  sdk: SDK
}

const dnSdkContext = createContext<DnSdkContextValue | null>(null)

export function useDnSdk() {
  const context = useContext(dnSdkContext)
  if (context == null) {
    throw Error('should provide datanexus sdk context')
  }
  return context
}

const sdkInstance = new SDK({
  /** 数据源 ID，必填 */
  user_action_set_id: 1210106408,
  /** 加密 key，必填 */
  secret_key: 'ccab8c48e79e78c3e9e42fb8b0ca500e',
  /** 微信小程序 APPID，wx 开头，必填 */
  appid: 'wx6ab76fba1b23c3da', // TODO: wx.getAccountInfoSync ?
  /** 微信 openid，openid 和 unionid 只能填一个（优先填写 openid）, 可以调用 setOpenId 设置 */
  // openid: 'user_openid',
  /** 微信 unionid，openid 和 unionid 只能填一个（优先填写 openid）, 可以调用 setUnionId 设置 */
  // unionid: 'user_unionid',
  /** 自定义用户 ID，选填 */
  // user_unique_id: 'user_unique_id',
  /** 是否开启自动采集，选填，默认为true */
  auto_track: true
})

export function DnSdkProvider({ children }: PropsWithChildren<any>) {

  useEffect(() => {
    userIDStore.getOpenID()
      .then(openID => {
        sdkInstance.setOpenId(openID)
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('datanexus sdk setOpenId failed:', error)
      })
  }, [])

  return (
    <dnSdkContext.Provider value={{ sdk: sdkInstance }}>
      {children}
    </dnSdkContext.Provider>
  )
}

export function loginTrack() {
  sdkInstance.track('LOGIN')
}

export function registerTrack() {
  sdkInstance.track('REGISTER')
}

/** 支付成功上报，quantity 单位：分 */
export function purchaseTrack(quantity: number) {
  sdkInstance.track('PURCHASE', { value: quantity })
}
