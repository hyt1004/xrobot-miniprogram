/**
 * @file: 平台兼容的获取系统信息的工具函数（ali version）
 */

import { createContext, useContext } from 'react'

import * as ali from 'remax/ali'

export type SystemInfo = {
  statusBarHeight: number
  appBarHeight: number
  platform: string
  screenWidth: number
  // 设备屏幕宽度(screenWidth)相对于 750 的缩放比例，用于 rpx 计算
  // 实际单位会被 remax 乘以这个比例。举个例子，statusBarHeight 是 20，设置的 20px 会被转换成 10px。
  // 所以 js 里面消费此的高宽等应该除以此变量
  scaleRatio: number
}

export const SystemInfoContext = createContext<SystemInfo | null>(null)

export function useSystemInfo() {
  const systemInfo = useContext(SystemInfoContext)

  if (systemInfo === null) {
    throw Error('Unable to get system info.')
  }

  return systemInfo
}

export function getSystemInfo(): Promise<SystemInfo | undefined> {
  return new Promise((resolve, reject) => {
    // 超时会返回 undefined
    ali.getSystemInfo().then(res => resolve(res && transformAliSystemInfo(res))).catch(reject)
  })
}

function transformAliSystemInfo(systemInfo: AliMiniprogram.IGetSystemInfoSuccessResult): SystemInfo {
  return {
    statusBarHeight: systemInfo.statusBarHeight,
    appBarHeight: systemInfo.titleBarHeight,
    platform: systemInfo.platform,
    screenWidth: systemInfo.screenWidth,
    scaleRatio: systemInfo.screenWidth / 750
  }
}
