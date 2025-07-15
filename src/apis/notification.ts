import { fetch, deleteJSON, putJSON } from '../utils/fetchs'
import { Channel, Message, MessageReadType, ChannelType, MessageWithContent } from '../constants/notification'
import { apiPrefix } from '../constants/api'

const prefix = `${apiPrefix}/portal-v4/api/proxy/notification`

export type GetMessageListOptions = {
  offset?: number
  limit?: number
  readType?: MessageReadType
  channelType?: ChannelType
}

export function getMessageList(
  { offset = 0, limit = 10, readType, channelType }: GetMessageListOptions
): Promise<{ count: number, data: Message[] | null }> {
  const data = {
    offset,
    limit,
    ...channelType != null && { channel_types: channelType },
    ...readType != null && { unread: readType === MessageReadType.Unread }
  }
  return fetch(
    `${prefix}/internal-msgs`,
    { data }
  )
}

export function getMessage(id: string): Promise<MessageWithContent> {
  return fetch(`${prefix}/internal-msg/detail`, { data: { id } })
}

export function getMessageUnreadCount(): Promise<number> {
  return fetch(`${prefix}/internal-msgs`, {
    data: {
      limit: 1,
      offset: 0,
      unread: true
    }
  }).then(res => res.count)
}

export function markMessageAsRead(id: string): Promise<void> {
  return putJSON(`${prefix}/internal-msg/read`, { id })
}

export function markAllMessageAsRead(): Promise<void> {
  return putJSON(`${prefix}/internal-msg/read-all`, {})
}

export function deleteMessage(id: string): Promise<Message[]> {
  return deleteJSON(`${prefix}/internal-msg?id=${id}`, {})
}

export function getChannel(id: string): Promise<Channel> {
  return fetch(`${prefix}/channel?id=${id}`)
}
