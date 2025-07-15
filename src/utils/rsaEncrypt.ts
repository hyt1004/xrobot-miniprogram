import JSEncrypt from 'wxmp-rsa'
import { ucBizApiPrefix } from '../constants/api'
import { fetchWithCommonRes } from './fetchs/fetchWithCommonRes'

export default async function rsaEncrypt(encryptValue:string) {
  const jsencrypt = new JSEncrypt()
  try {
    const { public_key: publicKey } = await fetchWithCommonRes(`${ucBizApiPrefix}/passport/public-key`)
    jsencrypt.setPublicKey(publicKey)
    const valueEncrypt = jsencrypt.encrypt(encryptValue)
    if (!valueEncrypt) {
      throw new Error('请求出错，请稍后再试')
    } else {
      return valueEncrypt
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
