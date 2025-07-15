import React, { ReactNode } from 'react'

import { View } from 'remax/one'
import { usePageEvent } from 'remax/macro'

import { shareToFriendOptions } from '../../constants/share'

import { useSystemInfo } from '../../utils/hooks/system-info'
import { ToastConsumer } from '../../utils/toast'
import { Consumer as ActivityConsumer } from '../Activity'

type ScaffoldProps = {
  appBar: ReactNode
  children: ReactNode
  customShareOption?: Record<string, string>
}

export default function Scaffold({ appBar, children, customShareOption = shareToFriendOptions }: ScaffoldProps) {
  const { statusBarHeight, appBarHeight } = useSystemInfo()
  const placeholderHeight = appBar ? statusBarHeight + appBarHeight : 0

  // 分享小程序设置
  // 放在这里是为了让所有页面右上角的分享按钮都生效
  usePageEvent('onShareAppMessage', () => customShareOption)

  return (
    <View>
      {appBar}
      {/* 占位用的方块，避免 body 部分被 appbar 挡住 */}
      <View
        style={{
          width: '100%',
          height: `${placeholderHeight}px`
        }}
      />
      <View>
        {children}
      </View>
      <ToastConsumer />
      <ActivityConsumer />
    </View>
  )
}

export function ScaffoldWithoutAppBar({ children, customShareOption = shareToFriendOptions }: Omit<ScaffoldProps, 'appBar'>) {
  usePageEvent('onShareAppMessage', () => customShareOption)
  usePageEvent('onShareTimeline', () => customShareOption)

  return (
    <View>
      {children}
      <ToastConsumer />
      <ActivityConsumer />
    </View>
  )
}
