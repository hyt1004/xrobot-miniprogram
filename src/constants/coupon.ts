/**
 * @file coupon 相关常量
 * @description 参考 https://github.com/qbox/gaea-admin/blob/develop/front/src/scripts/constant/newCoupon.coffee
 * https://github.com/qbox/gaea-admin/blob/develop/front/src/scripts/constant/couponStatus.coffee
 */

export enum OrderCouponState {
  Unknown = 'COUPON_STATE_UNKNOWN', // 未知
  Pending = 'COUPON_STATE_PENDING', // 未生效
  Usable = 'COUPON_STATE_USABLE', // 可使用
  Suspended = 'COUPON_STATE_SUSPENDED', // 已冻结
  Exhausted = 'COUPON_STATE_EXHAUSTED', // 已用完
  Expired = 'COUPON_STATE_EXPIRED', // 已过期
  Locked = 'COUPON_STATE_LOCKED', // 已锁定
  Canceled = 'COUPON_STATE_CANCELED', // 已撤销
}

export const orderCouponStateTextMap = {
  [OrderCouponState.Unknown]: '未知',
  [OrderCouponState.Pending]: '未生效',
  [OrderCouponState.Usable]: '可使用',
  [OrderCouponState.Suspended]: '已冻结',
  [OrderCouponState.Exhausted]: '已用完',
  [OrderCouponState.Expired]: '已过期',
  [OrderCouponState.Locked]: '已锁定',
  [OrderCouponState.Canceled]: '已撤销'
}

export enum CouponPayModeScope {
  Unknown = 'COUPON_PAY_MODE_SCOPE_UNKNOWN', // 未知
  Unlimited = 'COUPON_PAY_MODE_SCOPE_UNLIMITED', // 不限
  Prepaid = 'COUPON_PAY_MODE_SCOPE_PREPAID', // 预付费
  Postpaid = 'COUPON_PAY_MODE_SCOPE_POSTPAID' // 后付费
}

export const couponPayModeScopeTextMap = {
  [CouponPayModeScope.Unknown]: '未知',
  [CouponPayModeScope.Unlimited]: '不限',
  [CouponPayModeScope.Prepaid]: '预付费',
  [CouponPayModeScope.Postpaid]: '后付费'
}

export enum CouponPayModeScopeNum {
  Unknown = 0, // 未知
  Unlimited = 1, // 不限
  Prepaid = 2, // 预付费
  Postpaid = 3 // 后付费
}

export const couponPayModeScopeNumTextMap = {
  [CouponPayModeScopeNum.Unknown]: '未知',
  [CouponPayModeScopeNum.Unlimited]: '不限',
  [CouponPayModeScopeNum.Prepaid]: '预付费',
  [CouponPayModeScopeNum.Postpaid]: '后付费'
}

export enum BillCouponStatus {
  Ignore = 0, // 已撤销
  New = 1, // 未激活
  Active = 2, // 已激活
  Overdue = 3, // 已过期
  Cancel = 4 // 已撤消
}

export const billCouponStatusTextMap = {
  [BillCouponStatus.Ignore]: '已撤销',
  [BillCouponStatus.New]: '未激活',
  [BillCouponStatus.Active]: '已激活',
  [BillCouponStatus.Overdue]: '已过期',
  [BillCouponStatus.Cancel]: '已撤消'
}
