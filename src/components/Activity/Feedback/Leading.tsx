/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Mon Oct 11 2021
 * @file: 调查问卷的 Leading 按钮
 *
 * Copyright (c) 2021 Qiniu
 */

import React, { CSSProperties } from 'react'

import { View, Navigator } from 'remax/wechat'

import Icon from '../../../ui/Icon'
import { IconType } from '../../../constants/icons'
import { useSystemInfo } from '../../../utils/hooks/system-info'
import { greySeven } from '../../../utils/styles/color'

// 实际大小，单位 px
export const size = 24

export default function FeedbackActivityLeading() {
  const { appBarHeight, scaleRatio } = useSystemInfo()
  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: `${appBarHeight}px`
  }

  return (
    <View style={style}>
      <Navigator
        target="miniProgram"
        openType="navigate"
        appId="wxebadf544ddae62cb"
        path="pages/survey/index?sid=9037080&hash=5f8c"
        version="release"
      >
        <Icon type={IconType.Edit} size={`${size / scaleRatio}rpx`} color={greySeven} />
      </Navigator>
    </View>
  )
}
