import React from 'react'
import { View } from 'remax/one'

import { nameMap, Pages, routeMap } from '../../../constants/route'
import Scaffold from '../../../components/Scaffold'
import AppBar from '../../../components/AppBar'
import Navigator from '../../../components/Navigator'

import { shareOptions } from '../../../common/constants'

import styles from './index.less'

export default function NetConfigWelcome() {
  return (
    <Scaffold
      customShareOption={shareOptions}
      appBar={<AppBar title={nameMap[Pages.AgentNetConfigWelcome]} />}
    >
      <View className={styles.container}>
        <View className={styles.tip}>让您的设备快速连接网络</View>
        <Navigator url={routeMap[Pages.AgentNetConfigWifi]} action="navigate">
          <View className={styles.navBtn}>🔗 WiFi 配网</View>
        </Navigator>
        <Navigator url={routeMap[Pages.AgentNetConfigBluetooth]} action="navigate">
          <View className={styles.navBtn}>📱 蓝牙配网</View>
        </Navigator>
        <Navigator url={routeMap[Pages.AgentNetConfigGuide]} action="navigate">
          <View className={styles.navBtn}>📖 配网帮助</View>
        </Navigator>
      </View>
    </Scaffold>
  )
}
