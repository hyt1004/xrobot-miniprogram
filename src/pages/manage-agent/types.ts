export interface AgentCardProps {
  name: string
  deviceCount: number
  dialogModel: string
  ttsModel: string
  lastConnection: string
  onConfig: () => void
  onManage: () => void
  onChat: () => void
  onDelete: () => void
} 