/**
 * @file route 相关
 */

export const titlePrefix = 'Xrobot'

export enum Pages {
  // 主包
  Home = 'agent_manage_agent',
  AgentNetConfigWelcome = 'agent_net_config_welcome',
  AgentNetConfigGuide = 'agent_net_config_guide',
  AgentNetConfigWifi = 'agent_net_config_wifi',
  AgentNetConfigBluetooth = 'agent_net_config_bluetooth'
}

export const nameMap = {
  // 主包
  [Pages.Home]: '我的智能体',
  [Pages.AgentNetConfigWelcome]: '智能配网助手',
  [Pages.AgentNetConfigGuide]: '配网帮助',
  [Pages.AgentNetConfigWifi]: 'WiFi 配网',
  [Pages.AgentNetConfigBluetooth]: '蓝牙配网'
}

export const mainPackageUrlMap = {
  [Pages.Home]: 'pages/manage-agent/index',
  [Pages.AgentNetConfigWelcome]: 'pages/net-config/welcome/index',
  [Pages.AgentNetConfigGuide]: 'pages/net-config/guide/index',
  [Pages.AgentNetConfigWifi]: 'pages/net-config/wifi-config/index',
  [Pages.AgentNetConfigBluetooth]: 'pages/net-config/bluetooth-config/index'
}

export const mainPackageRoutes = Object.values(mainPackageUrlMap)


// 之所以不用 xxxUrlMap，是因为小程序配置不允许 pages 是从斜杠开头的, 但是路由可以
export const routeMap = {
  // 主包
  [Pages.Home]: '/pages/manage-agent/index',
  [Pages.AgentNetConfigWelcome]: '/pages/net-config/welcome/index',
  [Pages.AgentNetConfigGuide]: '/pages/net-config/guide/index',
  [Pages.AgentNetConfigWifi]: '/pages/net-config/wifi-config/index',
  [Pages.AgentNetConfigBluetooth]: '/pages/net-config/bluetooth-config/index'
}
