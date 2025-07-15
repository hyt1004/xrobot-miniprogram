import React, { useCallback, useState } from 'react'
import { View } from 'remax/one'

import { useToast } from '../../../../utils/toast'
import { searchBluetoothDevices, initBluetooth, resetBluetooth  } from '../bluetooth'
import { useBluetoothConfigContext, isIOS } from '../context'
import BluetoothItem from '../components/BluetoothItem'

import styles from './index.less'

// 对设备列表去重，保留信号最强的
function dedupeDeviceList(deviceList: WechatMiniprogram.BlueToothDevice[]): WechatMiniprogram.BlueToothDevice[] {
  const deviceMap = new Map<string, WechatMiniprogram.BlueToothDevice>()

  deviceList.forEach(device => {
    const existingDevice = deviceMap.get(device.deviceId)
    // 如果是新的设备或者信号比已存在的强，则更新
    if (!existingDevice || device.RSSI > existingDevice.RSSI) {
      deviceMap.set(device.deviceId, device)
    }
  })

  return Array.from(deviceMap.values())
}

const deviceNameReg = /^DTXZ/i

export default function SelectDevice() {
  const { currentStep, setCurrentStep, updateSelectedDevice } = useBluetoothConfigContext()
  const isActive = currentStep === 'select-device'
  const showToast = useToast()
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [deviceList, setDeviceList] = useState<WechatMiniprogram.BlueToothDevice[] | null>(null)
  const [isFirstScan, setIsFirstScan] = useState(true)

  const startDeviceScan = useCallback(async () => {
    setDeviceList(null)
    setIsLoadingDevices(true)
    try {
      if (isFirstScan) {
        // 首次扫描只需初始化
        await initBluetooth()
        setIsFirstScan(false)
      } else {
        // 后续扫描需要重置蓝牙模块
        await resetBluetooth()
      }

      const devices = await searchBluetoothDevices()
      console.log('devices', devices)
      // 过滤设备名称并去重
      // 如果是ios设备 根据LocalName过滤
      if (isIOS) {
        const validDeviceList = devices.filter(item => item.localName && deviceNameReg.test(item.localName)) as WechatMiniprogram.BlueToothDevice[]
        setDeviceList(dedupeDeviceList(validDeviceList))
      } else {
        const validDeviceList = devices.filter(item => item.name && deviceNameReg.test(item.name)) as WechatMiniprogram.BlueToothDevice[]
        setDeviceList(dedupeDeviceList(validDeviceList))
      }
    } catch (err) {
      showToast({ tip: '获取设备列表失败' })
      setDeviceList([])
    } finally {
      setIsLoadingDevices(false)
    }
  }, [showToast, isFirstScan])

  const handleSelectDevice = useCallback((device: WechatMiniprogram.BlueToothDevice) => {
      // 先更新选中的设备
      updateSelectedDevice({ ...device, connected: false })
      setCurrentStep('connect-device')
  }, [updateSelectedDevice, setCurrentStep, showToast])

  return (
    <View className={styles.container} style={{ display: isActive ? 'block' : 'none' }}>
      <View className={styles.stepTitle}>当前步骤：扫描蓝牙设备（以 DTXZ 开头）</View>
      <DeviceList
        isLoading={isLoadingDevices}
        deviceList={deviceList}
        onSelect={handleSelectDevice}
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
  deviceList: WechatMiniprogram.BlueToothDevice[] | null
  onSelect(device: WechatMiniprogram.BlueToothDevice): void
}

function DeviceList({ isLoading, deviceList, onSelect }: DeviceListProps) {
  if (isLoading) {
    return (
      <View className={styles.empty}>
        <View className={styles.loadingIcon} />
        <View className={styles.loadingText}>
          正在扫描蓝牙设备...
        </View>
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
          点击下方按钮扫描蓝牙设备（以 DTXZ 开头）
        </View>
      </View>
    )
  }
  if (deviceList.length === 0) {
    return <View className={styles.empty}>未发现 DTXZ 设备</View>
  }
  return (
    <View className={styles.deviceList}>
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>📱</View>
          已发现 {deviceList.length} 个 DTXZ 设备
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>👇</View>
          点击下方设备卡片，选择要配网的设备
        </View>
      </View>
      {deviceList.map((device) => (
        <BluetoothItem
          key={device.deviceId}
          deviceInfo={device}
          onTap={() => onSelect(device)}
        />
      ))}
    </View>
  )
}
