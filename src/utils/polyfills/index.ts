/**
 * @file polyfill content
 */

// 兼容 ios 真机环境下 Promise 不存在 finally 方法
if (!Promise.prototype.finally) {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.finally = function finallyFn(callback) {
    return this.then(
      res => callback && Promise.resolve(callback()).then(() => res),
      err => callback && Promise.resolve(callback()).then(() => { throw err })
    )
  }
}
