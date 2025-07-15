/**
 * 活动相关组件，全局弹窗。
 */
import React, { PropsWithChildren, useEffect, useState, createContext, createElement, useContext, useMemo } from 'react'

import FeedbackModal, { FeedbackActivity } from './Feedback/Modal'
import { Activity, ContextValue } from './types'

const context = createContext<ContextValue | null>(null)

export function useActivities() {
  const contextValue = useContext(context)
  if (contextValue === null) throw Error('Unsupported usage.')
  return contextValue
}

export function Provider({ children }: PropsWithChildren<Record<string, unknown>>) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // 初始化活动区域
  }, [])

  const contextValue = useMemo<ContextValue>(() => ({
    activities,
    add(activity: Activity) {
      setActivities([...activities, activity])
    },
    remove(activity: Activity) {
      setActivities(activities.filter(_activity => _activity !== activity))
    }
  }), [activities])

  return (
    <context.Provider value={contextValue}>
      {children}
    </context.Provider>
  )
}

const activityMap = new Map<new() => Activity, any>([[FeedbackActivity, FeedbackModal]])

export function Consumer() {
  return (
    <context.Consumer>
      {value => {
        if (value === null) {
          return null
        }

        return value.activities.map(activity => createElement(
          activityMap.get(activity.constructor as new () => Activity),
          {
            key: activity.id,
            activity
          }
        ))
      }}
    </context.Consumer>
  )
}
