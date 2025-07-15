import React, { useCallback, useState } from 'react'
import { View, Text } from 'remax/one'
import { useToast } from '../../../../utils/toast'
import { promisify } from '../../../../utils/promise'
import Popup from '../../../../ui/Popup'
import { waitTimeout } from '../../../../common/utils'
import { getConnectedWifi, connectWifi } from '../wifi'
import { useWifiConfigContext } from '../context'
import styles from './index.less'

export default function ConnectDevice() {
  const { currentStep, setCurrentStep, selectedDevice, updateSelectedDevice } = useWifiConfigContext()
  const isActive = currentStep === 'connect-device'
  const [manualModalVisible, setManualModalVisible] = useState(false)
  const showToast = useToast()

  const changeDevice = useCallback(() => {
    updateSelectedDevice(null)
    setCurrentStep('select-device')
  }, [updateSelectedDevice, setCurrentStep])

  const onConnected = useCallback(async () => {
    if (!selectedDevice) return
    // 验证设备热点是否正确连接
    const connectedWifi = await getConnectedWifi()

    // 验证是否连接到指定的设备热点
    if (connectedWifi?.SSID === selectedDevice.wifi.SSID) {
      updateSelectedDevice({ ...selectedDevice, connected: true })
    } else {
      showToast({ tip: '未正确连接到选定设备热点，请重试', icon: 'fail' })
    }
  }, [selectedDevice, showToast, updateSelectedDevice])

  const handleConnect = useCallback(async () => {
    if (!selectedDevice) return

    // 检查设备热点是否已连接
    const wifi = await getConnectedWifi()
    if (wifi && selectedDevice.wifi.SSID === wifi.SSID) {
      updateSelectedDevice({ ...selectedDevice, connected: true })
      showToast({ tip: '设备热点已连接', icon: 'success' })
      return
    }

    // 连接设备
    try {
      showToast({ tip: '正在连接设备...', icon: 'loading', duration: -1 })
      await Promise.race([
        waitTimeout(15000),
        connectWifi(selectedDevice.wifi.SSID, '', false) // 设备 WiFi 无密码，第三个参数表示非 iOS
      ])
      // 验证设备热点是否正确连接
      onConnected()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('连接设备热点失败:', e)
      setManualModalVisible(true)
    } finally {
      showToast(undefined)
    }
  }, [showToast, selectedDevice, updateSelectedDevice, onConnected])

  return (
    <View className={styles.container} style={{ display: isActive ? 'block' : 'none' }}>
      {selectedDevice != null && (
        <>
          <View className={styles.stepTitle}>连接设备热点</View>
          <View className={styles.selectedDevice}>
            <Text>已选择设备: 📶 {selectedDevice.wifi.SSID}</Text>
            {selectedDevice.connected && <Text>✅ 已连接</Text>}
          </View>
          {
            selectedDevice.connected
              ? <View className={styles.actionBtn} onTap={() => setCurrentStep('select-wifi')}>下一步</View>
              : <View className={styles.actionBtn} onTap={handleConnect}>🔗 连接设备热点</View>
          }
          <ManualModal
            visible={manualModalVisible}
            ssid={selectedDevice.wifi.SSID}
            onClose={() => setManualModalVisible(false)}
            onConnected={onConnected}
          />
        </>
      )}
      {selectedDevice == null && ( // 正常不会到这里
        <View className={styles.actionBtn} onTap={changeDevice}>选择设备</View>
      )}
    </View>
  )
}

interface ManualModalProps {
  visible: boolean
  ssid: string
  onClose: () => void
  onConnected: () => void
}

function ManualModal({ visible, ssid, onClose, onConnected }: ManualModalProps) {
  const openSystemSetting = useCallback(async () => {
    try {
      // 小程序没有直接跳转到系统 WiFi 设置的接口，只提供了这两个系统设置接口:
      // - wx.openAppAuthorizeSetting  微信应用授权设置
      // - wx.openSystemBluetoothSetting  蓝牙设置
      await promisify(wx.openAppAuthorizeSetting)()
      // eslint-disable-next-line no-console
      console.log('已跳转微信授权设置页')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('跳转微信授权设置页失败:', e)
    }
  }, [])

  const confirmConnected = useCallback(() => {
    onConnected()
    onClose()
  }, [onConnected, onClose])

  return (
    <Popup open={visible} position="center" onClose={onClose} className={styles.manualModal}>
      <View className={styles.content}>
        <View className={styles.header}>⚠️ 自动连接失败，请手动操作：</View>
        <View className={styles.tips}>
          <View className={styles.tip}>进入系统「无线局域网」设置</View>
          <View className={styles.tip}>连接名为「{ssid}」的 WiFi（无需密码）</View>
          <View className={styles.tip}>返回小程序，点击下方按钮继续操作</View>
        </View>
      </View>
      <View className={styles.actionBtn} onTap={openSystemSetting}>➡️ 前往系统设置</View>
      <View className={styles.actionBtn} onTap={confirmConnected}>✅ 已连接成功，继续操作</View>
    </Popup>
  )
}
