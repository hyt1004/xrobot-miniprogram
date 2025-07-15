/**
 * @file wallet api
 */

import { fetchWithCommonRes } from '../utils/fetchs/fetchWithCommonRes'

import { apiPrefix } from '../constants/api'
import { CreditStatus } from '../constants/credit'
import { OrderCouponState, BillCouponStatus } from '../constants/coupon'

import { isOverdue as isOverdueUtil } from '../utils/time'

import { GetCreditRes, getCredit } from './credit'
import {
  GetOrderCouponRes,
  BillCouponDetail,
  getOrderCoupon,
  getBillCoupon
} from './coupon'

const portalV4ApiPrefix = `${apiPrefix}/portal-v4`
const walletV4Prefix = `${apiPrefix}/walletv4`

export type CostOverviewWithExtra = CostOverview & Pick<GetCreditRes, 'creditLine'> & {
  unusedOrderCouponCount: number // 未使用订单抵用券数量（张数）
  unusedBillCouponCount: number // 未使用账单抵用券数量（张数）
}

export async function getCostOverviewWithExtra(): Promise<CostOverviewWithExtra | null> {
  let costOverviewWithExtra = {
    balance: 0,
    cashReserve: 0,
    nb: 0,
    creditLine: 0,
    allUndeductBillsMoney: 0,
    arrearMoney: 0,
    unusedOrderCouponCount: 0,
    unusedBillCouponCount: 0
  }

  // 更新基本的 CostOverview 信息
  function updateCostOverview(res: CostOverview) {
    costOverviewWithExtra = {
      ...costOverviewWithExtra,
      ...res
    }
  }

  // 更新信用额度信息
  function updateCreditLine(res: GetCreditRes) {
    const { creditLine, creditStatus } = res

    // 只有信用额度状态为生效中才取 creditLine 的值，否则为 0
    costOverviewWithExtra = {
      ...costOverviewWithExtra,
      creditLine: creditStatus === CreditStatus.Valid ? creditLine : 0
    }
  }

  // 更新可用的订单抵用券数量
  function updateUnusedOrderCouponCount(res: GetOrderCouponRes) {
    const { couponDetails } = res

    const count = (couponDetails || []).filter(
      orderCoupon => {
        const { state } = orderCoupon

        return state === OrderCouponState.Usable
      }
    ).length

    costOverviewWithExtra = {
      ...costOverviewWithExtra,
      unusedOrderCouponCount: count
    }
  }

  // 更新可用的账单抵用券数量
  function updateUnusedBillCouponCount(res: BillCouponDetail[]) {
    // 根据 status, deadTime, balance 判断账单抵用券是否有效
    const count = (res || []).filter(
      billCoupon => {
        const {
          status,
          balance: billCouponBalance,
          deadTime
        } = billCoupon

        const isActivated = status === BillCouponStatus.Active
        // 是否已过期能不能用 status === BillCouponStatus.Overdue 来判断
        // 应该判断 deadTime 是否处于当前时间之前
        const isOverdue = isOverdueUtil(deadTime)

        // 返回 isActivated && !isOverdue && billCouponBalance > 0 的项
        return isActivated && !isOverdue && billCouponBalance > 0
      }
    ).length

    costOverviewWithExtra = {
      ...costOverviewWithExtra,
      unusedBillCouponCount: count
    }
  }

  try {
    await Promise.all([
      getCostOverview().then(updateCostOverview),
      getCredit().then(updateCreditLine),
      getOrderCoupon().then(updateUnusedOrderCouponCount),
      getBillCoupon().then(updateUnusedBillCouponCount)
    ])
  } catch {
    return null
  }

  return costOverviewWithExtra
}

// 字段较多，这边先定义要用到的
// 所有字段参考
// https://github.com/qbox/portal-v4/blob/develop/service/src/app/gaea/controllers/financial/financial_statistics.go#L437
export type CostOverview = {
  balance: number
  cashReserve: number // 现金余额
  nb: number // 牛币
  allUndeductBillsMoney: number // 实时消费金额
  arrearMoney: number // 未支付金额
}

export async function getCostOverview(): Promise<CostOverview> {
  const {
    cash_reserve: cashReserve,
    all_undeduct_bills_money: allUndeductBillsMoney,
    arrear_money: arrearMoney,
    ...others
  } = await fetchWithCommonRes(`${portalV4ApiPrefix}/api/gaea/financial/costoverview`)

  return {
    cashReserve,
    allUndeductBillsMoney,
    arrearMoney,
    ...others
  }
}

export async function getExclusiveBankAccount(uid: number): Promise<string> {
  const { bank_virtual_account } = await fetchWithCommonRes(`${walletV4Prefix}/v1/bank-virtual-accounts/uid/${uid}`)
  return bank_virtual_account
}
