/**
 * @file share 相关（ali version）
 * @description 分享支付宝小程序相关常量，https://opendocs.alipay.com/mini/introduce/share
 */

import { Pages, routeMap } from '../route'

// 分享给朋友
// TODO
// 确认 title && desc
export const shareToFriendOptions = {
  title: '一站式中立音视频云+AI - 七牛云',
  desc: '七牛云 portal 小程序',
  path: routeMap[Pages.Home]
}
