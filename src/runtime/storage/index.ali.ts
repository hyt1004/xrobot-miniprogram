import { getStorageSync as getAliStorageSync, setStorageSync as setAliStorageSync } from 'remax/ali'

export function getStorageSync(key: string) {
  return getAliStorageSync({ key })
}

export function setStorageSync(key: string, data: any) {
  return setAliStorageSync({ key, data })
}
