import React, { useCallback, useEffect, useState, useRef } from 'react'
import { View } from 'remax/one'
import { useToast } from '../../../../utils/toast'
import { useBluetoothConfigContext, isIOS } from '../context'
import WifiItem from '../../wifi-config/components/WifiItem'
import styles from './index.less'
import { RECEIVE_CHARACTERISTIC_UUID, PRIMARY_SERVICE_UUID, SEND_CHARACTERISTIC_UUID } from '../bluetooth';


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


// 解析WiFi列表数据
function parseWifiList(data: Uint8Array, isIOS: boolean): WechatMiniprogram.WifiInfo[] {
  const wifiList: WechatMiniprogram.WifiInfo[] = []
  let offset = 0

  // 辅助函数：将UTF-8字节数组转换为字符串
  function utf8BytesToString(bytes: Uint8Array): string {
    const chars: number[] = []
    let i = 0
    while (i < bytes.length) {
      let byte = bytes[i]
      if (byte < 0x80) {
        // ASCII字符
        chars.push(byte)
        i++
      } else if (byte < 0xE0 && i + 1 < bytes.length) {
        // 双字节UTF-8
        chars.push(((byte & 0x1F) << 6) | (bytes[i + 1] & 0x3F))
        i += 2
      } else if (byte < 0xF0 && i + 2 < bytes.length) {
        // 三字节UTF-8
        chars.push(
          ((byte & 0x0F) << 12) |
          ((bytes[i + 1] & 0x3F) << 6) |
          (bytes[i + 2] & 0x3F)
        )
        i += 3
      } else {
        // 跳过无效字节
        i++
      }
    }
    return String.fromCharCode(...chars)
  }

  // 从日志数据分析：每个WiFi信息的格式为：
  // [length(总长度 1字节), RSSI(1字节), SSID(length-1字节)]
  while (offset < data.length) {
    const length = data[offset]     // 总长度
    const rssi = data[offset + 1] // RSSI值
    const ssidBytes = data.slice(offset + 2, offset + length + 1) // SSID内容
    try {
      // 解析SSID
      const ssid = utf8BytesToString(ssidBytes)

      // 处理rssi，转成strength
      let signalStrength = rssi > 127 ? rssi - 256 : rssi  // 补码转负数
      
      // RSSI 通常在 -100 到 0 之间，转换为 0-100 的信号强度
      if (signalStrength > 0) signalStrength = 0;  // 限制最大值
      if (signalStrength < -100) signalStrength = -100;  // 限制最小值
      
      // 将 -100～0 映射到 0～100
      signalStrength = isIOS ?((signalStrength + 100) / 100) : (signalStrength + 100)

      // 过滤掉空SSID和非法字符
      if (ssid && ssid.trim() && !/[\x00-\x1F\x7F]/.test(ssid)) {
        wifiList.push({
          SSID: ssid.trim(),
          BSSID: '',
          secure: true,
          signalStrength: signalStrength,
          frequency: 0
        })
      }
    } catch (error) {
      console.error('解析SSID出错:', error, '当前偏移:', offset)
    }
    
    // 移动到下一个WiFi信息
    offset += length + 1;
  }
  return dedupeWifiList(wifiList)
}


export default function SelectWifi() {
  const { currentStep, setCurrentStep, selectedDevice, updateSelectedWifi, sequenceControl } = useBluetoothConfigContext()
  const isActive = currentStep === 'select-wifi'
  const [wifiList, setWifiList] = useState<WechatMiniprogram.WifiInfo[]>()
  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  // 使用 useRef 维护状态
  const receivedData = useRef<{ sequence: number; data: number[] }[]>([])
  const currentPromise = useRef<{
    resolve: (value: WechatMiniprogram.WifiInfo[]) => void;
    reject: (reason: any) => void;
  } | null>(null)
  const currentTimeoutId = useRef<number | null>(null)

  // 在监听器中使用这些状态
  useEffect(() => {
    if (!selectedDevice) return

    // 注册监听器
    wx.notifyBLECharacteristicValueChange({
      deviceId: selectedDevice.deviceId,
      serviceId: PRIMARY_SERVICE_UUID,
      characteristicId: RECEIVE_CHARACTERISTIC_UUID,
      state: true,
      success: () => {
        console.log('启用通知成功')
      },
      fail: (err) => {
        console.error('启用通知失败:', err)
      }
    })
    
    // 监听数据
    const listener = (res: any) => {
      const value = new Uint8Array(res.value)
      console.log('收到数据:', Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' '))

      try {
        const type = value[0]
        const frameCtrl = value[1]
        const sequence = value[2]
        const curDataLen = value[3]

        // 处理ACK响应
        if ((type & 0x03) === 0 && (type >> 2) === 0) {
          console.log('收到ACK响应，序列号:', sequence)
          return
        }

        // 解析类型
        const mainType = type & 0x03  // 低2位是主类型
        const subType = type >> 2     // 高6位是子类型

        // WiFi列表数据包 (0x45 = 数据帧类型1 + 子类型17)
        if (mainType === 0x01 && subType === 0x11) {  // WiFi列表数据包
          // 保存数据包
          // 如果是分片帧
          const data = (frameCtrl & 0x10) ? value.slice(6, 6 + curDataLen) : value.slice(4, 4 + curDataLen)
          
          receivedData.current.push({
            sequence,
            data: Array.from(data)
          })

          // 检查是否是最后一个包
          if (frameCtrl === 0x04) {
            // 按序列号排序并合并数据
            const sortedData = receivedData.current
              .sort((a, b) => a.sequence - b.sequence)
              .flatMap(item => item.data)
            
            console.log('sortedData', sortedData)
            
            // 解析WiFi列表
            const wifiList = parseWifiList(new Uint8Array(sortedData), isIOS)
            console.log('解析到WiFi列表:', wifiList.map(wifi => ({
              ...wifi,
              SSID: wifi.SSID.trim(),  // 移除可能的空格
            })))
            
            // 清除超时定时器
            if (currentTimeoutId.current) {
              clearTimeout(currentTimeoutId.current)
              currentTimeoutId.current = null
            }
            
            if (currentPromise.current) {
              currentPromise.current.resolve(wifiList)
              currentPromise.current = null
            }
            
            // 重置接收缓冲区
            receivedData.current = []
          }
        }
      } catch (error) {
        console.error('处理数据出错:', error)
        // 清除超时定时器
        if (currentTimeoutId.current) {
          clearTimeout(currentTimeoutId.current)
          currentTimeoutId.current = null
        }
        
        if (currentPromise.current) {
          currentPromise.current.reject(error)
          currentPromise.current = null
        }
        // 重置接收缓冲区
        receivedData.current = []
      }
    }

    wx.onBLECharacteristicValueChange(listener)

    // 清理函数
    return () => {
      // 移除监听器
      wx.offBLECharacteristicValueChange(listener)
      
      // 关闭通知
      if (selectedDevice) {
        wx.notifyBLECharacteristicValueChange({
          deviceId: selectedDevice.deviceId,
          serviceId: PRIMARY_SERVICE_UUID,
          characteristicId: RECEIVE_CHARACTERISTIC_UUID,
          state: false
        })
      }
    }
  }, [selectedDevice]) // 只在设备变化时重新注册

  const getWifiList = useCallback((deviceId: string): Promise<WechatMiniprogram.WifiInfo[]> => {
    return new Promise((resolve, reject) => {
      // 清除之前的超时定时器
      if (currentTimeoutId.current) {
        clearTimeout(currentTimeoutId.current)
        currentTimeoutId.current = null
      }
      
      currentPromise.current = { resolve, reject }
      
      // 设置超时时间（10秒）
      currentTimeoutId.current = setTimeout(() => {
        if (currentPromise.current) {
          console.error('获取WiFi列表超时')
          currentPromise.current.reject(new Error('获取WiFi列表超时，请检查设备连接'))
          currentPromise.current = null
          currentTimeoutId.current = null
          // 重置接收缓冲区
          receivedData.current = []
        }
      }, 10000) // 10秒超时
      
      // 帧控制位设置
      const frameControl = 
        0x00 |  // bit 0: 不加密（控制帧不加密），不包含校验位
        0x00 |  // bit 2: 方向从手机到ESP设备（0）
        0x08 |  // bit 3: 要求回复ACK
        0x00    // bit 4: 无分片

    const cmd = new Uint8Array([
        (0x09 << 2) | 0x00,       // 类型：控制帧(0x0)和子类型(0x9)合并
        frameControl,  // 帧控制：0x08
        sequenceControl.current++,  // 序列号
        0x00,      // 数据长度：0
        // 0x00, 0x00 // 校验字段
      ])

      console.log('发送获取WiFi列表命令:', Array.from(cmd).map(b => b.toString(16).padStart(2, '0')).join(' '))

    wx.writeBLECharacteristicValue({
      deviceId,
      serviceId: PRIMARY_SERVICE_UUID,
      characteristicId: SEND_CHARACTERISTIC_UUID,
      value: cmd.buffer,
        success: () => {
          console.log('发送获取WiFi列表命令成功')
      },
      fail: (err) => {
        console.error('发送命令失败:', err)
        // 清除超时定时器
        if (currentTimeoutId.current) {
          clearTimeout(currentTimeoutId.current)
          currentTimeoutId.current = null
        }
        currentPromise.current?.reject(err)
        currentPromise.current = null
      }
    })
  })
  }, [])

  // 监听蓝牙设备发送的WiFi列表
  useEffect(() => {
    if (!isActive || !selectedDevice) return

    // 清除旧的WiFi列表数据
    setWifiList(undefined)
    setLoading(true)
    showToast({ tip: '正在获取WiFi列表...', icon: 'loading', duration: -1 })

    getWifiList(selectedDevice.deviceId)
      .then(wifiList => {
        setWifiList(wifiList)
        setLoading(false)
        showToast(undefined)
      })
      .catch(error => {
        console.error('获取WiFi列表失败:', error)
        const errorMessage = error.message || '获取WiFi列表失败，请检查连接状态并重试'
        showToast({ tip: errorMessage, icon: 'fail', duration: 3000 })
        setLoading(false)
      })

  }, [isActive, selectedDevice, showToast, getWifiList])

  const handleSelectWifi = useCallback((wifi: WechatMiniprogram.WifiInfo) => {
    updateSelectedWifi({
      SSID: wifi.SSID,
      signalStrength: wifi.signalStrength
    })
    setCurrentStep('input-pwd')
  }, [updateSelectedWifi, setCurrentStep])

  const handleRefresh = useCallback(() => {
    if (loading || !selectedDevice) return

    // 清除旧的WiFi列表数据
    setWifiList(undefined)
    setLoading(true)
    showToast({ tip: '正在刷新WiFi列表...', icon: 'loading', duration: -1 })

    getWifiList(selectedDevice.deviceId)
      .then(wifiList => {
        setWifiList(wifiList)
        setLoading(false)
        showToast(undefined)
      })
      .catch(error => {
        console.error('刷新WiFi列表失败:', error)
        const errorMessage = error.message || '刷新WiFi列表失败，请检查连接状态并重试'
        showToast({ tip: errorMessage, icon: 'fail', duration: 3000 })
        setLoading(false)
      })
  }, [loading, selectedDevice, showToast, getWifiList])

  if (!isActive) return null

  return (
    <View className={styles.container}>
      <View className={styles.stepTitle}>选择WiFi网络</View>
      <View className={styles.tips}>
        <View className={styles.tip}>
          <View className={styles.icon}>1️⃣</View>
          请确保设备和手机在同一WiFi环境下
        </View>
        <View className={styles.tip}>
          <View className={styles.icon}>2️⃣</View>
          选择要配置的WiFi网络
        </View>
      </View>
      <View className={styles.wifiList}>
        {wifiList?.map((wifi, index) => (
          <WifiItem
            key={`${wifi.SSID}-${index}`}
            isIOS={isIOS}
            wifiInfo={{
              SSID: wifi.SSID,
              BSSID: '',
              secure: false,
              signalStrength: wifi.signalStrength,
              frequency: 0
            }}
            onTap={() => handleSelectWifi(wifi)}
          />
        ))}
        {wifiList?.length === 0 && !loading && (
          <View className={styles.empty}>未发现WiFi网络</View>
        )}
      </View>
      <View 
        className={`${styles.actionBtn} ${loading ? styles.disabled : ''}`} 
        onTap={handleRefresh}
      >
        🔄 刷新WiFi列表
      </View>
    </View>
  )
}
