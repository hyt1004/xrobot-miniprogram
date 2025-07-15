import React from 'react'
import { Text, View } from 'remax/one'
import SignalStrength from './SignalStrength'
import styles from './index.less'

export interface Props {
  deviceInfo: WechatMiniprogram.BlueToothDevice
  onTap(): void
}

// 将蓝牙信号强度标准化到0-4的范围
function normalizeSignalStrength(rssi: number): number {
  // RSSI通常在-100到0之间，越接近0信号越强
  if (rssi >= -50) return 4
  if (rssi >= -60) return 3
  if (rssi >= -70) return 2
  if (rssi >= -80) return 1
  return 0
}

export default function BluetoothItem({ deviceInfo, onTap }: Props) {
  return (
    <View className={styles.bluetoothItem} onTap={onTap}>
      <View className={styles.deviceIcon}>📱</View>
      <View className={styles.content}>
        <View className={styles.name}>{deviceInfo.name || deviceInfo.deviceId}</View>
        <View className={styles.deviceId}>ID: {deviceInfo.deviceId}</View>
        <View className={styles.signalStrength}>
          <Text>信号强度: </Text>
          <SignalStrength strength={normalizeSignalStrength(deviceInfo.RSSI)} />
        </View>
      </View>
      <View className={styles.selectIcon}>选择 {'>'}</View>
    </View>
  )
} 