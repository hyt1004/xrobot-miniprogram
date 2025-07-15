/**
 * @file 当前登录用户信息提供组件
 */

import React, { PropsWithChildren, useContext, createContext, useEffect, useCallback, useMemo, useRef } from 'react'

import { useAppEvent } from 'remax/macro'

import { QiniuUserInfo, getQiniuUserInfo } from '../../apis/user'

import { useApiWithParams } from '../../utils/hooks/api'
import { useWhen } from '../../utils/hooks'
import * as sensors from '../../utils/sensors'
import { getBindUserIds, signinWithUserId } from '../../runtime'
import { useDnSdk } from '../../utils/datanexus'

export type UserInfoProps = QiniuUserInfo | null

export type UserInfoContextValue = {
  userInfo: UserInfoProps
  refreshUserInfo: () => Promise<void>
}

const context = createContext<UserInfoContextValue | null>(null)

/** 向子元素提供当前用户信息 */
export function Provider({ children }: PropsWithChildren<any>) {
  const {
    $: userInfo,
    loading: refreshing,
    call: refreshUserInfo
  } = useApiWithParams(getQiniuUserInfo, { params: [] })
  const whenRefreshed = useWhen(!refreshing)

  // 应用可见时重新获取 userInfo 信息
  useAppEvent('onShow', () => refreshUserInfo())

  const promisifyRefreshUserInfo = useCallback(() => {
    refreshUserInfo()
    return whenRefreshed()
  }, [refreshUserInfo, whenRefreshed])

  // onLaunch 时静默登录
  useAppEvent('onLaunch', async () => {
    const userIds = await getBindUserIds()

    // 只有绑定的账户数为 1 时，才进行静默登录
    if (userIds?.length !== 1) {
      return
    }

    // 这里 sso 登录可能需要两步验证，静默登录忽略，即静默登录失败
    signinWithUserId(userIds[0].userId).then(refreshUserInfo)
  })

  // 给神策 & 腾讯广告 sdk 用的关联 ID
  const uid = useMemo(() => userInfo?.uid, [userInfo])

  const dataNexusSdkRef = useRef(useDnSdk().sdk)

  useEffect(() => {
    const dataNexusSdk = dataNexusSdkRef.current
    if (uid) {
      // 神策埋点，关联登录 ID
      sensors.login(String(uid))
      // 腾讯广告 DataNexus SDK 自定义用户 ID 设置为七牛 uid
      dataNexusSdk.setUserUniqueId(String(uid))
    }
    return () => {
      sensors.logout()
      dataNexusSdk.setUserUniqueId('-') // 设置空字符串会报错
    }
  }, [uid])

  return (
    <context.Provider
      value={{
        userInfo,
        refreshUserInfo: promisifyRefreshUserInfo
      }}
    >
      {children}
    </context.Provider>
  )
}

/** 获取当前用户信息 */
export function useUserInfo(): UserInfoContextValue {
  const ctxValue = useContext(context)
  if (!ctxValue) {
    throw new Error('Missing `UserInfoProvider`.')
  }

  return ctxValue
}
