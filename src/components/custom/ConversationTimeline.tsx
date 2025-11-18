import { Card, Text, View } from 'reshaped'
import { Phone, Envelope, ChatCircle, VideoCamera, Robot, Microphone } from '@phosphor-icons/react'
import { CustomBadge } from './Badge'
import { Link } from 'react-router-dom'

export interface ConversationTimelineItem {
  id: string
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
  date: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  summary?: string
  subject?: string
  agent?: string
  duration?: number
  messageCount?: number
}

export interface ConversationTimelineProps {
  conversations: ConversationTimelineItem[]
  customerId?: string
  onConversationClick?: (_conversationId: string) => void
}

function getChannelIcon(channel: ConversationTimelineItem['channel']) {
  switch (channel) {
    case 'phone':
      return Phone
    case 'email':
      return Envelope
    case 'chat':
      return ChatCircle
    case 'video':
      return VideoCamera
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

function getSentimentColor(sentiment?: string): 'positive' | 'critical' | 'neutral' | null {
  switch (sentiment) {
    case 'positive':
      return 'positive'
    case 'negative':
      return 'critical'
    default:
      return 'neutral'
  }
}

export function ConversationTimeline({ conversations, customerId }: ConversationTimelineProps) {
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <View direction="column" gap={4}>
      {sortedConversations.map((conversation, index) => {
        const Icon = getChannelIcon(conversation.channel)
        const isLast = index === sortedConversations.length - 1

        return (
          <View key={conversation.id} direction="row" gap={4}>
            {/* Timeline line */}
            <View direction="column" align="center" attributes={{ style: { position: 'relative' } }}>
              <View
                attributes={{
                  style: {
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--rs-color-primary-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }
                }}
              >
                <Icon size={18} weight="bold" />
              </View>
              {!isLast && (
                <View
                  attributes={{
                    style: {
                      width: '2px',
                      height: '100%',
                      backgroundColor: 'var(--rs-color-neutral-border)',
                      marginTop: '8px',
                      minHeight: '40px'
                    }
                  }}
                />
              )}
            </View>

            {/* Content */}
            <View direction="column" gap={2} attributes={{ style: { flex: 1, paddingBottom: isLast ? 0 : '24px' } }}>
              <Card padding={4}>
                <View direction="column" gap={2}>
                  <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap', justifyContent: 'space-between' } }}>
                  <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
                    <Text variant="body-2" weight="medium">
                      {conversation.channel === 'ai-call' ? 'AI Call' : conversation.channel === 'voice-message' ? 'Voice Message' : conversation.channel.charAt(0).toUpperCase() + conversation.channel.slice(1).toUpperCase()}
                      {conversation.channel === 'phone' || conversation.channel === 'video' || conversation.channel === 'ai-call' || conversation.channel === 'voice-message' ? ' Call' : conversation.channel === 'email' || conversation.channel === 'sms' ? ' Thread' : ''}
                      {conversation.messageCount && (conversation.channel === 'email' || conversation.channel === 'sms') && (
                        <Text variant="caption-1" color="neutral-faded" as="span"> ({conversation.messageCount} messages)</Text>
                      )}
                    </Text>
                      {conversation.sentiment && (
                        <CustomBadge color={getSentimentColor(conversation.sentiment) || 'neutral'}>
                          {conversation.sentiment.charAt(0).toUpperCase() + conversation.sentiment.slice(1)}
                        </CustomBadge>
                      )}
                    </View>
                    <Text variant="caption-1" color="neutral-faded">
                      {new Date(conversation.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {conversation.subject && (
                    <Text variant="body-2" weight="medium">
                      {conversation.subject}
                    </Text>
                  )}

                  {conversation.summary && (
                    <Text variant="body-3" color="neutral-faded">
                      {conversation.summary}
                    </Text>
                  )}

                  <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
                    {conversation.agent && (
                      <Text variant="caption-1" color="neutral-faded">
                        Agent: {conversation.agent}
                      </Text>
                    )}
                    {conversation.duration && (
                      <Text variant="caption-1" color="neutral-faded">
                        Duration: {conversation.duration}m
                      </Text>
                    )}
                  </View>

                  <Link to={customerId ? `/triage/customers/${customerId}/conversations/${conversation.id}` : `/triage`}>
                    <Text variant="body-2" attributes={{ style: { color: 'var(--rs-color-primary)', cursor: 'pointer' } }}>
                      View Transcript →
                    </Text>
                  </Link>
                </View>
              </Card>
            </View>
          </View>
        )
      })}
    </View>
  )
}
