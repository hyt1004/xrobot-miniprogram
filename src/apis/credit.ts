/**
 * @file credit api
 */

import { fetchWithCommonRes } from '../utils/fetchs/fetchWithCommonRes'

import { apiPrefix } from '../constants/api'
import { CreditStatus } from '../constants/credit'

const portalV4ApiPrefix = `${apiPrefix}/portal-v4`

// 先定义需要用到的字段
export type GetCreditRes = {
  creditLine: number // 授信额度
  creditStatus: CreditStatus // 授信状态
}

export async function getCredit(): Promise<GetCreditRes> {
  const creditData = await fetchWithCommonRes(`${portalV4ApiPrefix}/api/gaea/financial/credits`)

  // 如果用户没有授信数据
  // creditData 为 undefined
  // 进行特殊处理
  if (!creditData) {
    return {
      creditLine: 0,
      creditStatus: CreditStatus.Unknown
    }
  }

  const {
    credit_line: creditLine,
    credit_status: creditStatus
  } = creditData

  return {
    creditLine,
    creditStatus
  }
}
