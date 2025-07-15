// 是否是站内链接
export function checkIsInnerUrl(url: string): boolean {
  return url.indexOf('pages') === 0 || url.indexOf('/pages') === 0
}

// 返回前一个页面的路由
export function getPrePageRoute(): string {
  const pages = getCurrentPages()

  // 没有取到页面栈的实例 || 页面栈中只存在当前页面
  if (!pages || !pages.length || pages.length === 1) {
    return ''
  }

  // 这里取到的 route 最前面不带 /
  // 为了方便和 constants/route 中的 routeMap 作对比
  // 手动拼上一个 / 再返回
  const { route } = pages[pages.length - 2]

  return `/${route}`
}
