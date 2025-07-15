import sensors from 'sa-sdk-miniprogram'
import userIDStore from '../stores/userID'
import { SmsType } from '../constants/totp'

/** 初始化神策埋点 */
export async function init() {
  sensors.setPara({
    name: 'sensors',
    server_url: 'https://sensors.qiniu.com/sa?project=default',
    // 全埋点控制开关
    autoTrack: {
      appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
      appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
      appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
      pageShow: true, // 默认为 true，false 则关闭 $MPViewScreen 事件采集
      pageShare: true, // 默认为 true，false 则关闭 $MPShare 事件采集
      mpClick: true, // 默认为 false，true 则开启 $MPClick 事件采集
      mpFavorite: true, // 默认为 true，false 则关闭 $MPAddFavorites 事件采集
      pageLeave: true // 默认为 false， true 则开启 $MPPageLeave事件采集
    },
    // 自定义渠道追踪参数，如 source_channel: ["custom_param"]
    source_channel: [],
    // 是否允许控制台打印查看埋点数据(建议开启查看)
    show_log: true,
    // 是否允许修改 onShareAppMessage 里 return 的 path，用来增加(登录 ID，分享层级，当前的 path)，在 app onShow 中自动获取这些参数来查看具体分享来源、层级等
    allow_amend_share_path: true
  })

  // 设置匿名 ID 为 OpenID
  // https://manual.sensorsdata.cn/sa/2.3/sdk-api-7551849.html#SDKAPI(%E5%B0%8F%E7%A8%8B%E5%BA%8F)-%E8%AE%BE%E7%BD%AE%E5%8C%BF%E5%90%8DID%E4%B8%BAOpenID
  try {
    const openID = await userIDStore.getOpenID()
    sensors.setOpenid(openID)
    sensors.init()
  } catch (_) {
    sensors.init()
  }
}

/**
 * 关联登录 ID，
 * https://manual.sensorsdata.cn/sa/2.3/sdk-api-7551849.html#SDKAPI(%E5%B0%8F%E7%A8%8B%E5%BA%8F)-%E5%85%B3%E8%81%94%E7%99%BB%E5%BD%95ID
 */
export function login(id: string) {
  sensors.login(id)
}

/** 退出登录 ID，即使用 first_id 作为 distinct_id */
export function logout() {
  sensors.logout()
}

/** 退出登录 ID，即使用 first_id 作为 distinct_id */
export function track(e: string, p?: Record<string, unknown> | undefined) {
  sensors.track(e, p)
}

/** 注册事件上报 */
export function signupTracker(props: {
  /** Portal 上报时错写成 is_signin_success，便于数据统计，所以将错就错 */
  isSigninSuccess: boolean
  mobile: string
  fullname: string
  userId?: string
  qrKey?: string
  responseCode: string | number | undefined
  /** au_type: 非微信验证时，是 sms 或 voice; 微信验证时(mobile 有值)，是 wechat_phone */
  auType: 'wechat_phone' | SmsType
}) {
  track('Signup', {
    is_signin_success: props.isSigninSuccess,
    mobile: props.mobile,
    fullname: props.fullname,
    user_id: props.userId,
    qr_key: props.qrKey,
    response_code: props.responseCode,
    au_type: props.auType
  })
}

/** 登录事件上报 */
export function signinTracker(props: {
  /** qrKey 代表扫码登录 */
  qrKey?: string
  isSigninSuccess: boolean
}) {
  track('Signin', {
    is_signin_success: props.isSigninSuccess,
    qr_key: props.qrKey
  })
}
