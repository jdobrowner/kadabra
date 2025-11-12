import { Icon, Text, View } from 'reshaped'
import { Phone, VideoCamera, Envelope, ChatCircle, Clock, Robot, Microphone } from '@phosphor-icons/react'
import { formatRelativeTime } from '../../utils/formatTime'

export interface Communication {
  type: 'phone' | 'video' | 'email' | 'sms' | 'ai-call' | 'voice-message'
  count: number
  lastTime: string // ISO date string or timestamp
}

export interface CommunicationChannelsProps {
  communications: Communication[]
  textColor?: 'neutral' | 'neutral-faded'
}

function getCommunicationIcon(type: Communication['type']) {
  switch (type) {
    case 'phone':
      return Phone
    case 'video':
      return VideoCamera
    case 'email':
      return Envelope
    case 'sms':
      return ChatCircle
    case 'ai-call':
      return Robot
    case 'voice-message':
      return Microphone
    default:
      return Phone
  }
}

export function CommunicationChannels({ communications, textColor = 'neutral' }: CommunicationChannelsProps) {
  // Sort communications by most recent (compare by date)
  const sortedCommunications = [...communications].sort((a, b) => {
    const aDate = new Date(a.lastTime).getTime()
    const bDate = new Date(b.lastTime).getTime()
    return bDate - aDate // Most recent first (larger timestamp)
  })

  const mostRecentTime = sortedCommunications.length > 0 
    ? formatRelativeTime(sortedCommunications[0].lastTime)
    : ''

  return (
    <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
      {mostRecentTime && (
        <>
          <Icon 
            svg={<Clock weight="bold" />} 
            attributes={{ 
              style: { color: textColor === 'neutral-faded' ? 'var(--rs-color-foreground-neutral-faded)' : 'var(--rs-color-foreground-neutral)' } 
            }} 
          />
          <Text variant="body-2" color={textColor}>
            {mostRecentTime}
          </Text>
          {sortedCommunications.length > 0 && (
            <Text variant="body-2" color={textColor}>•</Text>
          )}
        </>
      )}
      {sortedCommunications.map((comm, index) => {
        const IconComponent = getCommunicationIcon(comm.type)
        const label = comm.type === 'phone' ? (comm.count === 1 ? 'Call' : 'Calls') :
                     comm.type === 'video' ? (comm.count === 1 ? 'Video' : 'Videos') :
                     comm.type === 'email' ? (comm.count === 1 ? 'Email' : 'Emails') :
                     comm.type === 'ai-call' ? (comm.count === 1 ? 'AI Call' : 'AI Calls') :
                     comm.type === 'voice-message' ? (comm.count === 1 ? 'Voice Message' : 'Voice Messages') :
                     'SMS'
        return (
          <View key={`${comm.type}-${index}`} direction="row" gap={1} align="center">
            <Icon 
              svg={<IconComponent weight="bold" />}
              attributes={{ 
                style: { color: textColor === 'neutral-faded' ? 'var(--rs-color-foreground-neutral-faded)' : 'var(--rs-color-foreground-neutral)' } 
              }} 
            />
            <Text variant="body-2" color={textColor}>
              {comm.count} {label}
            </Text>
            {index < sortedCommunications.length - 1 && (
              <Text variant="body-2" color={textColor}>•</Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

