export enum ChannelType {
  Finance = 0,
  Account = 1,
  Product = 2,
  Activity = 3
}

export const channelTypeNameMap = {
  [ChannelType.Finance]: '财务',
  [ChannelType.Account]: '账号',
  [ChannelType.Product]: '产品',
  [ChannelType.Activity]: '活动'
}

export type Channel = {
  name: string
  // true 表示业务上对客户端不可见
  unusable: boolean
}

export type Message = {
  id: string,
  uid: number,
  channelId: string,
  channelType: ChannelType,
  title: string,
  contentType: number,
  isRead: boolean,
  // 单位，秒
  createdAt: number,
  updatedAt: number
}

export type MessageWithContent = Message & {
  content: string
}

export const channelTypes = [ChannelType.Finance, ChannelType.Account, ChannelType.Product, ChannelType.Activity]

export enum MessageReadType {
  Read,
  Unread
}

export const messageReadTypes = [MessageReadType.Read, MessageReadType.Unread]

export const messageReadTypeNameMap = {
  [MessageReadType.Read]: '已读消息',
  [MessageReadType.Unread]: '未读消息'
}
