import React, { useState } from 'react'
import { View } from 'remax/one'
import Button from '../../ui/Button'
import AppBar from '../../components/AppBar'
import Dialog from '../../ui/Dialog'
import Input from '../../ui/Input'
import AgentCard from './components/AgentCard'
import styles from './index.less'

const DEFAULT_AGENT = {
  name: 'test_default_agent',
  deviceCount: 0,
  dialogModel: '七牛ATP',
  ttsModel: '七牛HS双流式语音合成',
  lastConnection: '暂无'
}

const ManageAgent: React.FC = () => {
  const [createDialogVisible, setCreateDialogVisible] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agents] = useState([DEFAULT_AGENT])

  const handleCreateAgent = () => {
    // TODO: 实现创建智能体逻辑
    setCreateDialogVisible(false)
    setAgentName('')
  }

  const handleConfigAgent = () => {
    // TODO: 实现配置角色逻辑
  }

  const handleManageDevice = () => {
    // TODO: 实现设备管理逻辑
  }

  const handleViewChat = () => {
    // TODO: 实现查看聊天记录逻辑
  }

  const handleDeleteAgent = () => {
    // TODO: 实现删除智能体逻辑
  }

  return (
    <View className={styles.agentPage}>
      <AppBar title='我的智能体' />
      
      <View className={styles.agentPage__content}>
        {agents.map((agent, index) => (
          <AgentCard
            key={index}
            {...agent}
            onConfig={handleConfigAgent}
            onManage={handleManageDevice}
            onChat={handleViewChat}
            onDelete={handleDeleteAgent}
          />
        ))}
      </View>

      <View className={styles.agentPage__footer}>
        <Button 
          mode="primary" 
          className={styles.footerButton} 
          onTap={() => setCreateDialogVisible(true)}
        >
          + 创建智能体
        </Button>
        <Button 
          mode="default" 
          className={styles.footerButton}
        >
          我的设置
        </Button>
      </View>

      <Dialog
        open={createDialogVisible}
        closeText="取消"
        onClose={() => setCreateDialogVisible(false)}
      >
        <View className={styles.createDialog}>
          <View className={styles.createDialog__label}>智能体名称</View>
          <Input
            value={agentName}
            onChange={setAgentName}
            placeholder='请输入智能体名称'
            maxLength={50}
          />
          <View className={styles.createDialog__tip}>名称长度不超过50个字符</View>
        </View>
      </Dialog>
    </View>
  )
}

export default ManageAgent 