import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { View } from 'remax/one'

import { useToast } from '../../../../utils/toast'
import { postJSON } from '../../../../utils/fetchs'

import { useWifiConfigContext } from '../context'

import styles from './index.less'

type Result = {
  success: false,
  error: '无效的 SSID' | '无法连接到 WiFi' | '请求失败' | string
} | {
  success: true
  // TODO
}

export default observer(function SubmitConfig() {
  const { currentStep, selectedDevice, ssidState, passwordState, setCurrentStep } = useWifiConfigContext()
  const isActive = currentStep === 'submit-config'
  const showToast = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const handleSubmit = useCallback(async () => {
    // TODO: 需要再次检查前置条件吗
    // 发送配置
    setIsSubmitting(true)
    try {
      showToast({ tip: '配网中...', icon: 'loading', duration: -1 })
      const res: Result = await postJSON('http://192.168.4.1/submit', {
        ssid: ssidState.value,
        password: passwordState.value
      })
      setResult(res)
      showToast(undefined)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('/submit 请求失败:', e)
      showToast({ tip: '配网失败', icon: 'fail' })
      setResult({ success: false, error: '请求失败' })
      return
    } finally {
      setIsSubmitting(false)
    }

  }, [showToast, ssidState, passwordState])

  useEffect(() => {
    if (!isActive) return
    handleSubmit()
  }, [isActive, handleSubmit])

  const renderErrorTips = (error: string | undefined) => {
    if (error === '无效的 SSID') {
      return (
        <View className={styles.tips}>
          <View className={styles.tip}>WiFi名称不能为空</View>
          <View className={styles.tip}>WiFi名称包含非法字符</View>
          <View className={styles.tip}>WiFi名称长度超出限制</View>
        </View>
      )
    }
    if (error === '无法连接到 WiFi') {
      return (
        <View className={styles.tips}>
          <View className={styles.tip}>WiFi名称错误</View>
          <View className={styles.tip}>WiFi密码错误</View>
          <View className={styles.tip}>WiFi信号太弱</View>
          <View className={styles.tip}>设备不支持该WiFi网络</View>
          <View className={styles.tip}>WiFi已被关闭或不存在</View>
        </View>
      )
    }
    if (error === '请求失败') {
      return (
        <View className={styles.tips}>
          <View className={styles.tip}>设备不在配网模式</View>
          <View className={styles.tip}>请检查设备状态后重试</View>
        </View>
      )
    }
    // 其他错误情况
    return (
      <View className={styles.tips}>
        <View className={styles.tip}>WiFi密码错误</View>
        <View className={styles.tip}>WiFi信号太弱</View>
        <View className={styles.tip}>设备不支持该WiFi网络</View>
        <View className={styles.tip}>WiFi已被关闭或不存在</View>
        <View className={styles.tip}>设备不在配网模式</View>
        <View className={styles.tip}>请检查设备状态后重试</View>
      </View>
    )
  }

  return (
    <View className={styles.container} style={{ display: isActive ? 'block' : 'none' }}>
      {isSubmitting && (
        <>
          <View className={styles.header}>⌛️ 配网中...</View>
          <View className={styles.text}>📶 {selectedDevice?.wifi.SSID}</View>
          <View className={styles.text}>连接：{ssidState.value}</View>
        </>
      )}
      {!isSubmitting && result && result.success && (
        <>
          <View className={styles.header}>🎉️ 配网成功！</View>
          <View className={styles.text}>📶 {selectedDevice?.wifi.SSID} 已成功连接到 {ssidState.value}</View>
        </>
      )}
      {!isSubmitting && result && !result.success && (
        <>
          <View className={styles.header}>☹️ 配网失败</View>
          <View className={styles.text}>错误原因：{result.error}</View>
          {renderErrorTips(result.error)}
          <View
            className={styles.actionBtn}
            onTap={() => setCurrentStep('input-pwd')}
          >
            🔄 重新配置Wi-Fi
          </View>
        </>
      )}
    </View>
  )
})
