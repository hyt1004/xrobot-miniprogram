/**
 * @file config content
 */

import {
  AppConfig as WechatAppConfig,
  PageConfig as WechatPageConfig
} from 'remax/wechat'

import {
  mainPackageRoutes,
  titlePrefix
} from '../constants/route'

import { white } from './styles/color'

export function getWechatAppConfig(title?: string): WechatAppConfig {
  const appConfig: WechatAppConfig = {
    // 不支持深色
    darkmode: false,
    pages: [...mainPackageRoutes],
    window: {
      navigationBarTitleText: title || titlePrefix,
      navigationBarBackgroundColor: white,
      navigationBarTextStyle: 'black',
      navigationStyle: 'custom'
    },
    navigateToMiniProgramAppIdList: [
      // 小程序问卷反馈 appid
      'wxebadf544ddae62cb'
    ],
    plugins: {
      // "小艾视频播放器"
      'm-video': {
        version: 'latest',
        provider: 'wxd4709e80d42cb833'
      }
    },
    permission: {
      'scope.userLocation': {
        desc: '你的位置信息将用于获取附近的 WiFi 列表'
      }
    }
  }

  return appConfig
}

export function getWechatPageConfig(config?: Omit<WechatPageConfig, 'navigationBarTitleText'>): WechatPageConfig {
  return { ...config }
}

export function isTabBarPage(url: string) {
  const route = url.split('?')[0]
  const { tabBar } = getWechatAppConfig()
  return !!(tabBar?.list.some(item => item.pagePath === route))
}
