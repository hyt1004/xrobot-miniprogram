/**
 * @file transforms index content
 */

// web 端 cookie 是用分号分隔的
// 需要将 response header 中的 Set-Cookie 转换成 web cookie 格式
export function transformCookieToWeb(origin: string) {
  if (!origin) return ''

  const filterRegex = /(^(QINIU_SSO_SESSION=|SSID=|PORTAL_UID=).*?);/

  const splitArr = origin.split(',')
  const matchArr = splitArr.map((item: string) => {
    const match = item.trim().match(filterRegex)
    return match && match[1] || ''
  })

  return matchArr.filter(item => !!item).join('; ')
}

export function combineCookie(oldCookie: string, newCookie: string): string {
  // cookie为空直接返回
  if (!oldCookie || !newCookie) {
    return oldCookie + newCookie
  }

  const cookieMap = new Map<string, string>()

  oldCookie.split(';').forEach(item => {
    cookieMap.set(item.split('=')[0].trim(), item)
  })

  // 新cookie覆盖旧cookie
  newCookie.split(';').forEach(item => {
    cookieMap.set(item.split('=')[0].trim(), item)
  })

  return Array.from(cookieMap.values()).join(';')
}

// 隐藏手机号中间四位
export function makeMobileAnon(mobile: string | number) {
  const regex = /(\d{3})\d{4}(\d{4})/
  return `${mobile}`.replace(regex, '$1****$2')
}

// 隐藏身份证号中间十位
export function makeIDNumberAnon(id: string | number) {
  const regex = /(\d{4})\d{10}(\d{4})/
  return `${id}`.replace(regex, '$1**********$2')
}

// 隐藏银行卡号中间几位
// 参考 https://github.com/qbox/portal-v4/blob/develop/service/src/app/gaea/controllers/user/identity/identity_show.go#L154
export function makeBankAccountAnon(account: string | number) {
  const accountStr = `${account}`
  const length = accountStr.length

  if (length >= 8 && length <= 10) {
    const anonStr = (new Array(length - 6 + 1)).join('*')
    return `${accountStr.slice(0, 3)}${anonStr}${accountStr.slice(-3)}`
  }

  if (length > 10) {
    const anonStr = (new Array(length - 8 + 1)).join('*')
    return `${accountStr.slice(0, 4)}${anonStr}${accountStr.slice(-4)}`
  }

  return accountStr
}

// 将后端返回的金额转换为以元为单位的格式（后端存的金额会 * 10000）
export function asYuan(money: number) {
  // 避免出现 10000 转换为 1.00 的情况
  return Math.round(money / 100) / 100
}

// 将后端返回的金额转换为以分为单位的格式（后端存的金额会 * 100）
export function asFen(money: number) {
  return Math.round(money / 100)
}

// 以千位分隔符分隔金额
export function splitMoneyByComma(money: string | number) {
  const moneyStr = `${money}`
  // 处理金额带小数的情况
  const splitArr = moneyStr.split('.')
  splitArr[0] = splitArr[0].replace(/(?=(\B\d{3})+$)/g, ',')
  return splitArr.join('.')
}

// 计算折扣（保留一位小数）
// 例如：9.8
export function calDiscount(fee: number, cFee: number): string {
  const discount = cFee / fee * 10
  return discount.toFixed(1)
}
