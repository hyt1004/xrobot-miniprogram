/**
 * @file 财务信息提供组件
 */

import React, { PropsWithChildren, useContext, createContext, useEffect } from 'react'

import { useUserInfo } from '../UserInfo'

import { CostOverviewWithExtra, getCostOverviewWithExtra } from '../../apis/wallet'

import { useApi } from '../../utils/hooks/api'
import { useWhen } from '../../utils/hooks'

export type CostOverviewProps = CostOverviewWithExtra | null

export type CostOverviewContextValue = {
  costOverview: CostOverviewProps
  refreshCostOverview: () => Promise<void>
}

const context = createContext<CostOverviewContextValue | null>(null)

/** 向子元素提供当前财务信息 */
export function Provider({ children }: PropsWithChildren<any>) {
  const { userInfo } = useUserInfo()

  const {
    $: costOverview,
    loading: refreshing,
    call: refreshCostOverview
  } = useApi(getCostOverviewWithExtra)
  const whenRefreshed = useWhen(!refreshing)

  // userInfo 变更自动重新获取一次 costoverview 信息
  useEffect(() => refreshCostOverview(), [userInfo, refreshCostOverview])

  function promisifyRefreshCostOverview() {
    refreshCostOverview()
    return whenRefreshed()
  }

  return (
    <context.Provider
      value={{
        costOverview,
        refreshCostOverview: promisifyRefreshCostOverview
      }}
    >
      {children}
    </context.Provider>
  )
}

/** 获取当前财务信息 */
export function useCostOverview(): CostOverviewContextValue {
  const ctxValue = useContext(context)
  if (!ctxValue) {
    throw new Error('Missing `CostOverviewProvider`.')
  }

  return ctxValue
}
