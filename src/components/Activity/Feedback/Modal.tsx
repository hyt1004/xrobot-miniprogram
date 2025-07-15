/**
 * 微信调查问卷
 * TODO: 重构 tabBar 的时候，让首页、控制台、我的共用一个 Scaffold
 */
import React, { useState, useEffect, useRef } from 'react'
import { View, Button, Image, Text, Navigator, createAnimation, createSelectorQuery } from 'remax/wechat'

import Mask from '../../../components/Mask'
import { useSystemInfo } from '../../../utils/hooks/system-info'

import qiniuIcon from './qiniu.svg'
import closeIcon from './close.svg'
import styles from './modal.less'
import { useActivities } from '../index'
import { Activity } from '../types'
import { size as leadingSize } from './Leading'

export class FeedbackActivity extends Activity {
  constructor() {
    super('RMBWEB-2213@feedback')
  }

  public isAlive() {
    return !this.hasStoppedToday
  }
}

export default function FeedbackModal({ activity }: { activity: FeedbackActivity }) {
  const { remove } = useActivities()
  const { statusBarHeight, appBarHeight } = useSystemInfo()
  const [animation] = useState(() => createAnimation({ duration: 200 }))
  const [animationData, setAnimationData] = useState<any>(animation.export())
  const positionRef = useRef<{ x: number, y: number, width: number, height: number }>()
  const [showMaskBg, setShowMaskBg] = useState(true)
  // 拿到 leading icon 的坐标和 modal 的坐标，然后 translate 过去
  function handleClose() {
    if (positionRef.current == null) return
    const xScaleRatio = leadingSize / positionRef.current.width
    const yScaleRatio = leadingSize / positionRef.current.height
    // 弹窗缩小后位移前，其位置会发生变化，计算出此时的 x 坐标
    const beforeTranslateOffsetX = positionRef.current.x + positionRef.current.width / 2
      + (positionRef.current.width - leadingSize) / 2
    // 16 是 leading 距离屏幕左边的 px 距离
    // / xScaleRatio 是因为这个距离也随着被 scale 缩小了，所以需要放大相同倍率
    const finalOffsetX = (16 - beforeTranslateOffsetX) / xScaleRatio
    const beforeTranslateOffsetY = positionRef.current.y + positionRef.current.height / 2
      + (positionRef.current.height - leadingSize) / 2
    const finalOffsetY = (statusBarHeight + (appBarHeight - leadingSize) / 2 - beforeTranslateOffsetY) / yScaleRatio
    animation
      .scale(xScaleRatio, yScaleRatio)
      .translate(
        finalOffsetX,
        finalOffsetY
      )
      .opacity(0)
      .step({ duration: 550, timingFunction: 'ease-in-out' })
    setAnimationData(animation.export())
    setShowMaskBg(false)
  }

  useEffect(() => {
    createSelectorQuery().select('#feedback-modal').boundingClientRect(rect => {
      positionRef.current = { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    }).exec()
  }, [])

  function handleTransitionEnd() {
    activity.stop()
    remove(activity)
  }

  return (
    <Mask
      withBg={showMaskBg}
      coverTopNav
      show
    >
      <View
        id="feedback-modal"
        animation={animationData}
        onTransitionEnd={handleTransitionEnd}
        className={styles.main}
      >
        <View className={styles.square} />
        <View className={styles.light} />
        <Image className={styles.image} src={qiniuIcon} />
        <View onTap={handleClose} className={styles.close}>
          <Image src={closeIcon} />
        </View>
        <View className={styles.title}>问卷邀请</View>
        <View className={styles.text}>
          诚邀您参与七牛小程序问卷调研！
        </View>
        <Navigator
          target="miniProgram"
          openType="navigate"
          appId="wxebadf544ddae62cb"
          path="pages/survey/index?sid=9037080&hash=5f8c"
          version="release"
          onComplete={handleClose}
        >
          <Button className={styles.button}>
            <Text className={styles.buttonText}>立即参与</Text>
          </Button>
        </Navigator>
      </View>
    </Mask >
  )
}
