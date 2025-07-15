/**
 * @file 认证相关
 * @description 和 portal.io && portal-v4 保持一致
 * https://github.com/qbox/portal.qiniu.io/blob/develop/front/src/modules/developers/scripts/constants/identityType.coffee
 * https://github.com/qbox/portal.qiniu.io/blob/develop/front/src/modules/developers/scripts/constants/identityStatus.coffee
 * https://github.com/qbox/portal-v4/blob/develop/portal/front/src/app/base/constant/gaea/identityStatusV2.coffee
 */

export enum IdentityType {
  // 个人相关
  PersonalBank = 1,
  PersonalAlipay = 2,
  // 企业相关
  EnterpriseBusinessBank = 3,
  EnterpriseOrgnizationBank = 4,
  EnterpriseUnifiedSocialBank = 5,
  EnterpriseBusinessAlipay = 6,
  EnterpriseOrgnizationAlipay = 7,
  EnterpriseUnifiedSocialAlipay = 8,
  // 销售相关
  SalesGuarantee = 9,

  PersonalFaceActionLive = 10,                   // 个人动作活体人脸核验认证
  PersonalBankFourMeta = 11,                     // 个人银行卡四要素 + 人脸核验认证
  EnterpriseLegalPerson = 12                     // 企业法人认证
}

export const identityTypeTextMap = {
  [IdentityType.PersonalBank]: '个人银行认证',
  [IdentityType.PersonalAlipay]: '个人支付宝认证',
  [IdentityType.EnterpriseBusinessBank]: '企业营业执照银行认证',
  [IdentityType.EnterpriseOrgnizationBank]: '企业组织机构代码银行认证',
  [IdentityType.EnterpriseUnifiedSocialBank]: '企业统一社会信息号码银行认证',
  [IdentityType.EnterpriseBusinessAlipay]: '企业营业执照支付宝认证',
  [IdentityType.EnterpriseOrgnizationAlipay]: '企业组织机构代码支付宝认证',
  [IdentityType.EnterpriseUnifiedSocialAlipay]: '企业统一社会信息号码支付宝认证',
  [IdentityType.SalesGuarantee]: '销售担保认证',
  [IdentityType.PersonalFaceActionLive]: '个人人脸核验认证',
  [IdentityType.PersonalBankFourMeta]: '个人银行卡四要素认证',
  [IdentityType.EnterpriseLegalPerson]: '企业法人认证'
}

export enum IdentityStatus {
  Audit = 1,
  Failed = 2,
  Succeeded = 3,
  PersonalToEnterprise = 4,
  PersonalToEnterpriseFailed = 5,
  Invalid = 6
}

export const identityStatusTextMap = {
  [IdentityStatus.Audit]: '待审核',
  [IdentityStatus.Failed]: '认证失败',
  [IdentityStatus.Succeeded]: '认证通过',
  [IdentityStatus.PersonalToEnterprise]: '个人认证升级企业认证',
  [IdentityStatus.PersonalToEnterpriseFailed]: '个人认证升级企业认证失败',
  [IdentityStatus.Invalid]: '认证失效'
}

export enum IdentityStep {
  Done = 0,
  Audit = 1,
  Remit = 2,
  Backfill = 3,
  Review = 4
}

export const identityStepTextMap = {
  [IdentityStep.Done]: '已完成',
  [IdentityStep.Audit]: '待审核',
  [IdentityStep.Remit]: '已审核待打款',
  [IdentityStep.Backfill]: '已审核已打款待回填',
  [IdentityStep.Review]: '人工复核'
}
