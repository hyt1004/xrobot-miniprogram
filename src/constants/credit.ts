/**
 * @file credit 相关常量
 * @description 参考 https://github.com/qbox/bo/blob/develop-portal/portal.com/financial/src/constants/credit.ts
 */

export enum CreditStatus {
  Unknown = 0, // 未知状态
  Unauthorized = 1, // 未授信
  Unactivated = 2, // 未激活
  Valid = 3, // 生效中
  Revoked = 4 // 已停用
}

export const creditStatusTextMap = {
  [CreditStatus.Unknown]: '未知状态',
  [CreditStatus.Unauthorized]: '未授信',
  [CreditStatus.Unactivated]: '未激活',
  [CreditStatus.Valid]: '生效中',
  [CreditStatus.Revoked]: '已停用'
}
