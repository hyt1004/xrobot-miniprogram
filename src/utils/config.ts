/**
 * @file config content
 */

import {
  AppConfig as WechatAppConfig,
  PageConfig as WechatPageConfig
} from 'remax/wechat'

import {
  mainPackageRoutes,
  titlePrefix,
  mainPackageUrlMap,
  Pages
} from '../constants/route'
import { iconMap as tabBarIconMap } from '../constants/tab-bar'

import { white, black, primaryColor } from './styles/color'

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
    tabBar: {
      color: black,
      selectedColor: primaryColor,
      backgroundColor: white,
      borderStyle: 'white',
      list: [{
        pagePath: mainPackageUrlMap[Pages.Home],
        text: '首页',
        selectedIconPath: tabBarIconMap[Pages.Home].active
      }]
    },
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
