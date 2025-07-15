import React, { useCallback, useState } from 'react'
import { View } from 'remax/one'

import { useToast } from '../../../../utils/toast'
import { getWifiList } from '../wifi'
import { useWifiConfigContext } from '../context'
import WifiItem from '../components/WifiItem'

import styles from './index.less'

// 对设备列表去重，保留信号最强的
function dedupeDeviceList(deviceList: WechatMiniprogram.WifiInfo[]): WechatMiniprogram.WifiInfo[] {
  const deviceMap = new Map<string, WechatMiniprogram.WifiInfo>()

  deviceList.forEach(device => {
    const existingDevice = deviceMap.get(device.SSID)
    // 如果是新的 SSID 或者信号比已存在的强，则更新
    if (!existingDevice || device.signalStrength > existingDevice.signalStrength) {
      deviceMap.set(device.SSID, device)
    }
  })

  return Array.from(deviceMap.values())
}

const deviceSSIDReg = /^(xiaozhi|xiaoling)/

export default function SelectDevice() {
  const { isIOS, currentStep, setCurrentStep, updateSelectedDevice } = useWifiConfigContext()
  const isActive = currentStep === 'select-device'
  const showToast = useToast()
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [deviceList, setDeviceList] = useState<WechatMiniprogram.WifiInfo[] | null>(null)

  const startDeviceScan = useCallback(async () => {
    setDeviceList(null)
    setIsLoadingDevices(true)
    try {
      const wifiList = await getWifiList(isIOS, true)
      // 过滤设备热点并去重
      const validDeviceList = wifiList.filter(item => deviceSSIDReg.test(item.SSID.toLowerCase()))
      setDeviceList(dedupeDeviceList(validDeviceList))
    } catch (err) {
      showToast({ tip: '获取设备列表失败' })
      setDeviceList([])
    } finally {
      setIsLoadingDevices(false)
    }
  }, [showToast, isIOS])

  const handleSelectDevice = useCallback((device: WechatMiniprogram.WifiInfo) => {
    updateSelectedDevice({ wifi: device, connected: false })
    setCurrentStep('connect-device')
  }, [updateSelectedDevice, setCurrentStep])

  return (
    <View className={styles.container} style={{ display: isActive ? 'block' : 'none' }}>
      <View className={styles.stepTitle}>当前步骤：扫描设备热点（以 Xiaoling 或 Xiaozhi 开头）</View>
      <DeviceList
        isLoading={isLoadingDevices}
        deviceList={deviceList}
        onSelect={handleSelectDevice}
        isIOS={isIOS}
      />
      {!isLoadingDevices && (
        <View className={styles.actionBtn} onTap={startDeviceScan}>
          {deviceList == null ? '🔍 开始扫描' : '🔍 重新扫描'}
        </View>
      )}
    </View>
  )
}

interface DeviceListProps {
  isLoading: boolean
  deviceList: WechatMiniprogram.WifiInfo[] | null
  onSelect(device: WechatMiniprogram.WifiInfo): void
  isIOS: boolean
}

function DeviceList({ isLoading, deviceList, onSelect, isIOS }: DeviceListProps) {
  if (isLoading) {
    return (
      <View className={styles.empty}>
        <View className={styles.loadingIcon} />
        <View className={styles.loadingText}>正在扫描设备热点...</View>
      </View>
    )
  }
  if (deviceList == null) {
    return (
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>1️⃣</View>
          确认设备已通电并处于配网模式
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>2️⃣</View>
          点击下方按钮扫描设备热点（以 Xiaoling 或 Xiaozhi 开头）
        </View>
      </View>
    )
  }
  if (deviceList.length === 0) {
    return <View className={styles.empty}>未发现 Xiaoling 或 Xiaozhi 设备</View>
  }
  return (
    <View className={styles.wifiList}>
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>📱</View>
          已发现 {deviceList.length} 个 Xiaoling 或 Xiaozhi 设备
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>👇</View>
          点击下方设备卡片，选择要配网的设备
        </View>
      </View>
      {deviceList.map((device, index) => (
        <WifiItem
          key={index}
          isIOS={isIOS}
          wifiInfo={device}
          onTap={() => onSelect(device)}
        />
      ))}
    </View>
  )
}
