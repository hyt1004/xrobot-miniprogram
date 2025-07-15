import dayjs from 'dayjs'

import { getStorageSync, setStorageSync } from '../../runtime/storage'

export type StorageType = {
  // 单位 ms
  stoppedTime?: number | null
}

export abstract class Activity {
  public abstract isAlive(): boolean

  constructor(public id: string) { }

  public get isStopped(): boolean {
    const { stoppedTime } = getStorageSync<StorageType>(`activity-${this.id}`) ?? {}
    return stoppedTime != null
  }

  /** 今天是否关过 */
  public get hasStoppedToday() {
    const { stoppedTime } = getStorageSync<StorageType>(`activity-${this.id}`) ?? {}
    if (stoppedTime == null) return false
    const todayZeroTime = dayjs().startOf('day').valueOf()
    const stoppedZeroTime = dayjs(stoppedTime).startOf('day').valueOf()
    if ((stoppedZeroTime === todayZeroTime) && this.isStopped) {
      return true
    }
    return false
  }

  public open() {
    setStorageSync<StorageType>(`activity-${this.id}`, { stoppedTime: null })
  }

  public stop() {
    setStorageSync<StorageType>(`activity-${this.id}`, { stoppedTime: Date.now() })
  }
}

export type ContextValue = {
  activities: Activity[]
  add(activity: Activity): void
  remove(activity: Activity): void
}
