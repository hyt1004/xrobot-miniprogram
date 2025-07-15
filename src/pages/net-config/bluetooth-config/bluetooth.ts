/// <reference types="miniprogram-api-typings" />
import { promisify } from '../../../utils/promise'

export interface BluetoothDevice extends WechatMiniprogram.BluetoothDeviceInfo {
  connected?: boolean
}

// 初始化蓝牙模块
export async function initBluetooth() {
  try {
    await promisify(wx.openBluetoothAdapter)()
    console.log('蓝牙初始化成功')
  } catch (error) {
    console.error('蓝牙初始化失败:', error)
    throw new Error('请开启手机蓝牙后重试')
  }
}

// 重置蓝牙模块
export async function resetBluetooth() {
  try {
    await promisify(wx.stopBluetoothDevicesDiscovery)()
    await promisify(wx.closeBluetoothAdapter)()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await initBluetooth()
  } catch (error) {
    console.error('重置蓝牙模块失败:', error)
    throw error
  }
}

// 搜索蓝牙设备
export async function searchBluetoothDevices(): Promise<WechatMiniprogram.BlueToothDevice[]> {
  try {
    // 开始搜索
    await promisify(wx.startBluetoothDevicesDiscovery)({
      allowDuplicatesKey: false,
    })

    // 等待一段时间以收集设备
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 获取搜索到的设备
    const { devices } = await promisify(wx.getBluetoothDevices)()
    console.log('搜索到的设备:', devices)

    return devices
  } catch (error) {
    console.error('搜索蓝牙设备失败:', error)
    throw error
  }
}

// 存储 primary uuid 的变量
export let PRIMARY_SERVICE_UUID = '0000FFFF-0000-1000-8000-00805F9B34FB';
export let SEND_CHARACTERISTIC_UUID = '0000FF01-0000-1000-8000-00805F9B34FB';
export let RECEIVE_CHARACTERISTIC_UUID = '0000FF02-0000-1000-8000-00805F9B34FB';

// 连接蓝牙设备
export async function connectBluetoothDevice(deviceId: string) {
  try {
    await promisify(wx.createBLEConnection)({ deviceId })
    console.log('设备连接成功')
    const res = await promisify(wx.getBLEDeviceServices)({ deviceId })
    console.log('获取设备服务成功:', res)
    for (const service of res.services) {
      console.log('service', service.uuid, 'isPrimary', service.isPrimary)
      if (service.isPrimary) {
        // 存储uuid名，给其他页面使用
        PRIMARY_SERVICE_UUID = service.uuid;
        const characteristicsRes = await promisify(wx.getBLEDeviceCharacteristics)({
          deviceId: deviceId,
          serviceId: service.uuid,
        })
        console.log('获取设备特性成功:', characteristicsRes)
        for (const characteristic of characteristicsRes.characteristics) {
          console.log('characteristic', characteristic.uuid, 'properties', characteristic.properties)
          if (characteristic.properties.write) {
            SEND_CHARACTERISTIC_UUID = characteristic.uuid;
          }
          if (characteristic.properties.notify) {
            RECEIVE_CHARACTERISTIC_UUID = characteristic.uuid;
          }
        }
      }
    }
  }
  catch (error) {
    console.error('设备连接失败:', error)
    throw error
  }
}
    
// 获取已连接的蓝牙设备
export async function getConnectedBluetoothDevices(): Promise<WechatMiniprogram.BlueToothDevice[]> {
  try {
    if (!PRIMARY_SERVICE_UUID) {
      console.log('蓝牙设备未连接')
      return []
    }
    const { devices } = await promisify(wx.getConnectedBluetoothDevices)({
      services: [PRIMARY_SERVICE_UUID], // 指定特定服务
    })
    return devices as WechatMiniprogram.BlueToothDevice[]
  } catch (error) {
      console.error('获取已连接设备失败:', error)
      throw error
    }
}




