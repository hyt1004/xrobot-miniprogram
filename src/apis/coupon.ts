/**
 * @file coupon api
 */

import { fetchWithCommonRes } from '../utils/fetchs/fetchWithCommonRes'

import { apiPrefix } from '../constants/api'
import {
  OrderCouponState,
  CouponPayModeScope,
  CouponPayModeScopeNum,
  BillCouponStatus
} from '../constants/coupon'

const portalV4ApiPrefix = `${apiPrefix}/portal-v4`

// 后端返回字段较多
// 这边先定义需要用到的
export type OrderCouponDetail = {
  couponCode: string
  name: string
  state: OrderCouponState
  money: number // 订单抵用券面额
  balance: number, // 订单抵用券余额
  effectTime: string
  deadTime: string
  thresholdMoney: number // 门槛金额
  isMultipleUse: boolean // 是否可多次使用
  couponScopeDesc: string // 适用产品
  payModeScope: CouponPayModeScope // 使用场景
  arrearCanUse: boolean // 是否欠费可用
}

// 后端返回的 count, money, thresholdMoney 字段都是 string 类型的
// 需要在返回之前进行一次转换
export type GetOrderCouponRes = {
  count: number
  couponDetails: OrderCouponDetail[]
}

// 获取全部订单抵用券
// 前端再 根据 state 进行过滤
export async function getOrderCoupon(): Promise<GetOrderCouponRes> {
  const {
    count: countStr,
    coupon_details: couponDetailsApiRes
  } = await fetchWithCommonRes(`${portalV4ApiPrefix}/api/gaea/financial/coupon/detail/list`)

  // 对 couponDetailsApiRes 中需要转换的字段进行转换
  // 包括字段名和值的类型
  const couponDetails = (couponDetailsApiRes || []).map(
    (data: any) => {
      const {
        coupon_code: couponCode,
        money: moneyStr,
        balance: balanceStr,
        effect_time: effectTime,
        dead_time: deadTime,
        threshold_money: thresholdMoneyStr,
        is_multiple_use: isMultipleUse,
        coupon_scope_desc: couponScopeDesc,
        pay_mode_scope: payModeScope,
        arrear_can_use: arrearCanUse,
        ...otherItems
      } = data

      return {
        couponCode,
        money: parseInt(moneyStr, 10),
        balance: parseInt(balanceStr, 10),
        effectTime,
        deadTime,
        thresholdMoney: parseInt(thresholdMoneyStr, 10),
        isMultipleUse,
        couponScopeDesc,
        payModeScope,
        arrearCanUse,
        ...otherItems
      }
    }
  )

  return {
    count: parseInt(countStr, 10),
    couponDetails
  }
}

// 后端返回字段较多
// 这边先定义需要用到的
// 需要在返回之前进行一次转换
export type BillCouponDetail = {
  id: string
  title: string
  status: BillCouponStatus
  desc: string
  deadTime: number // 后端返回 hundred nano second 格式，需要 / 10000 才能使用
  day: number
  quota: number // 账单抵用券面额
  balance: number // 账单抵用券余额
  arrearCanUse: boolean // 是否欠费可用
}

// 获取全部账单抵用券
// 前端再 根据 status 进行过滤
export async function getBillCoupon(): Promise<BillCouponDetail[]> {
  const couponDetailsApiRes = await fetchWithCommonRes(`${portalV4ApiPrefix}/api/gaea/voucher/list`)

  // 对 couponDetailsApiRes 中需要转换的字段进行转换
  const couponDetails = (couponDetailsApiRes || []).map(
    (data: any) => {
      const { deadtime: deadTimeNano, ...others } = data

      return {
        deadTime: deadTimeNano / 10000, // 后端返回 hundred nano second 格式，需要 / 10000 才能使用
        ...others
      }
    }
  )

  return couponDetails
}

export type AvailableOrderCoupon = {
  balance: number // 订单抵用券余额，需要 / 10000
  couponCode: string
  deadTime: number // 过期时间，后端返回精确到秒，需要 * 1000 才能使用
  description: string
  effectTime: number // 生效时间，后端返回精确到秒，需要 * 1000 才能使用
  isMultipleUse: boolean // 是否可多次使用
  money: number // 订单抵用券面额，需要 / 10000
  name: string
  payModeScope: CouponPayModeScopeNum // 使用场景
  scopeDesc: string // 适用产品
  thresholdMoney: number // 门槛金额，需要 / 10000
}

// 先定义要用到的字段
export type GetAvailableOrderCouponRes = {
  coupons: AvailableOrderCoupon[]
}

export async function getAvailableOrderCoupon(unionOrderHash: string): Promise<GetAvailableOrderCouponRes> {
  const options = {
    union_order_hash: unionOrderHash
  }

  const { coupons: couponsApiRes } = await fetchWithCommonRes(
    `${portalV4ApiPrefix}/api/gaea/financial/order/available-coupon`,
    { data: options }
  )

  let couponRes = (couponsApiRes || []).map(
    (data: any) => {
      const {
        balance,
        coupon_code: couponCode,
        dead_time: deadTimeSec,
        description,
        effect_time: effectTimeSec,
        is_multiple_use: isMultipleUse,
        money,
        name,
        pay_mode_scope: payModeScope,
        scope_desc: scopeDesc,
        threshold_money: thresholdMoney
      } = data

      return {
        balance,
        couponCode,
        deadTime: deadTimeSec * 1000,
        description,
        effectTime: effectTimeSec * 1000,
        isMultipleUse,
        money,
        name,
        payModeScope,
        scopeDesc,
        thresholdMoney
      }
    }
  )

  couponRes = couponRes.sort((preCoupon: AvailableOrderCoupon, nextCoupon: AvailableOrderCoupon) => {
    const { balance: preBalance, deadTime: preDeadTime } = preCoupon
    const { balance: nextBalance, deadTime: nextDeadTime } = nextCoupon

    // 如果抵用券余额相同
    // 那么快到期的抵用券排在前面
    if (preBalance === nextBalance) {
      return preDeadTime - nextDeadTime
    }

    // 抵用券余额不同的时候
    // 余额大的抵用券排在前面
    return nextBalance - preBalance
  })

  return {
    coupons: couponRes
  }
}
