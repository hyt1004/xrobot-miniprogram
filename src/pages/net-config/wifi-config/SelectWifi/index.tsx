import React, { useCallback, useState } from 'react'
import { observer } from 'mobx-react'
import { View, Image } from 'remax/one'
import cns from 'classnames'

import { useToast } from '../../../../utils/toast'
import Popup from '../../../../ui/Popup'
import Input from '../../../../ui/Input'
import { bindTextInput } from '../../../../utils/form'
import FieldErrorTip from '../../../../components/FieldErrorTip'
import loadingIcon from '../../../../common/loading.svg'

import { getWifiList } from '../wifi'
import { useWifiConfigContext } from '../context'
import WifiItem from '../components/WifiItem'

import styles from './index.less'

// 对 WiFi 列表去重，保留信号最强的
function dedupeWifiList(wifiList: WechatMiniprogram.WifiInfo[]): WechatMiniprogram.WifiInfo[] {
  const wifiMap = new Map<string, WechatMiniprogram.WifiInfo>()

  wifiList.forEach(wifi => {
    const existingWifi = wifiMap.get(wifi.SSID)
    // 如果是新的 SSID 或者信号比已存在的强，则更新
    if (!existingWifi || wifi.signalStrength > existingWifi.signalStrength) {
      wifiMap.set(wifi.SSID, wifi)
    }
  })

  return Array.from(wifiMap.values())
}

export default observer(function SelectWifi() {
  const { isIOS, currentStep, setCurrentStep, ssidState } = useWifiConfigContext()
  const isActive = currentStep === 'select-wifi'
  const showToast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [wifiList, setWifiList] = useState<WechatMiniprogram.WifiInfo[] | null>(null)
  const [inputModalVisible, setInputModalVisible] = useState(false)

  const startWifiScan = useCallback(async () => {
    setWifiList(null)
    setIsLoading(true)
    try {
      const wifiInfos = await getWifiList(isIOS)
      // 过滤掉空 SSID 和 xiaozhi / xiaoling 开头的 SSID 并去重
      const validWifiList = wifiInfos.filter(item => item.SSID && !/^(xiaozhi|xiaoling)/i.test(item.SSID))
      setWifiList(dedupeWifiList(validWifiList))
    } catch (err) {
      showToast({ tip: '获取 WiFi 列表失败' })
      setWifiList([])
    } finally {
      setIsLoading(false)
    }
  }, [showToast, isIOS])

  const getWifiInfos = useCallback(async () => {
    startWifiScan()
  }, [startWifiScan])

  const handleSelectWifi = useCallback((wifi: WechatMiniprogram.WifiInfo) => {
    ssidState.set(wifi.SSID)
    setCurrentStep('input-pwd')
  }, [ssidState, setCurrentStep])

  const handleConfirmInput = useCallback(async () => {
    const res = await ssidState.validate()
    if (res.hasError) return
    setCurrentStep('input-pwd')
  }, [ssidState, setCurrentStep])

  return (
    <View className={styles.container} style={{ display: isActive ? 'block' : 'none' }}>
      <View className={styles.stepTitle}>当前步骤：选择路由器 WiFi</View>
      <WifiList
        isLoading={isLoading}
        wifiList={wifiList}
        onSelect={handleSelectWifi}
        isIOS={isIOS}
      />
      {!isLoading && (
        <>
          <View className={styles.actionBtn} onTap={getWifiInfos}>
            {wifiList == null ? '🔍 开始扫描' : '🔍 重新扫描'}
          </View>
          <View className={styles.actionBtn} onTap={() => setInputModalVisible(true)}>✏️ 手动输入 WiFi 名称</View>
        </>
      )}
      <Popup open={inputModalVisible} position="bottom" onClose={() => setInputModalVisible(false)}>
        <View className={styles.form}>
          <View className={styles.item}>
            <View className={cns(styles.label, styles.required)}>WiFi 名称</View>
            <Input
              className={cns(styles.input, ssidState.error && styles.error)}
              placeholder="请输入 WiFi 名称"
              {...bindTextInput(ssidState)}
            />
            <FieldErrorTip for={ssidState} />
          </View>
          <View className={styles.actionBtn} onTap={handleConfirmInput}>确定</View>
        </View>
      </Popup>
    </View>
  )
})

interface WifiListProps {
  isLoading: boolean
  wifiList: WechatMiniprogram.WifiInfo[] | null
  onSelect(wifi: WechatMiniprogram.WifiInfo): void
  isIOS: boolean
}

function WifiList({ isLoading, wifiList, onSelect, isIOS }: WifiListProps) {
  if (isLoading) {
    return (
      <View className={styles.empty}>
        <Image className={styles.loadingIcon} src={loadingIcon} />
        <View className={styles.loadingText}>正在扫描路由器 WiFi 网络...</View>
      </View>
    )
  }
  if (wifiList == null) {
    return (
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>1️⃣</View>
          确保手机已开启WiFi和定位权限
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>2️⃣</View>
          点击下方按钮扫描可用的WiFi网络
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>3️⃣</View>
          如果没有扫描到目标网络，可以手动输入
        </View>
      </View>
    )
  }
  if (wifiList.length === 0) {
    return (
      <View className={styles.empty}>
        <View className={styles.icon}>🛜</View>
        未扫描到 WiFi 网络
      </View>
    )
  }
  return (
    <View className={styles.wifiList}>
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>🛜</View>
          已发现 {wifiList.length} 个 WiFi 网络
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>👇</View>
          点击下方WiFi卡片，选择要连接的网络
        </View>
      </View>
      {wifiList.map((wifi, index) => (
        <WifiItem
          key={index}
          isIOS={isIOS}
          wifiInfo={wifi}
          onTap={() => onSelect(wifi)}
        />
      ))}
    </View>
  )
}
