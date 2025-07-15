/**
 * @file share 相关（wechat version）
 * @description 分享微信小程序相关常量，https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onshareappmessageobject-object
 */

import { Pages, routeMap } from '../route'

// 分享给朋友
// TODO
// 确认 title
export const shareToFriendOptions = {
  title: '一站式中立音视频云+AI - 七牛云',
  path: routeMap[Pages.Home],
  imageUrl: 'https://portal-mp-static.qiniu.com/img-share.png?t=1612344369643'
}
