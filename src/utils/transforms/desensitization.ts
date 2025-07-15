/**
 * @description 脱敏函数
 */

export default class Desensitization {
  static Email(value: string) {
    if (!value) return value

    const regex = /^(.{2})(.+)(@.*)$/

    if (!regex.test(value)) {
      const [perfix, host] = value.split('@')

      if (perfix.length <= 1 || !host) {
        return value
      }

      return perfix.slice(0, 1) + '*@' + host
    }

    return value.replace(regex, (_v, capture1, capture2, capture3) => `${capture1}${new Array(capture2.length).fill('*').join('')}${capture3}`)
  }

  static Mobile(value: string) {
    if (!value) return value

    return value.slice(0, -8) + '****' + value.slice(-4)
  }
}
