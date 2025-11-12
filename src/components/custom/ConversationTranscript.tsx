import { Card, Text, View } from 'reshaped'
import { CustomBadge } from './Badge'
import { Phone, Envelope, ChatCircle, VideoCamera, Robot, Microphone } from '@phosphor-icons/react'

export interface ConversationTranscriptProps {
  conversation: {
    id: string
    customerId: string
    channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
    date: string
    transcript: string
    summary?: string
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
    intent?: string
    duration?: number
    agent?: string
    subject?: string
    insights?: string[]
    coachingSuggestions?: string[]
    keyStats?: Record<string, string | number | boolean>
  }
}

function getChannelIcon(channel: ConversationTranscriptProps['conversation']['channel']) {
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

export function ConversationTranscript({ conversation }: ConversationTranscriptProps) {
  const Icon = getChannelIcon(conversation.channel)
  const isEmail = conversation.channel === 'email'

  return (
    <View direction="column" gap={4}>
      {/* Header */}
      <Card padding={6}>
        <View direction="column" gap={3}>
          <View direction="row" gap={3} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
            <Icon size={24} weight="bold" />
            <View direction="column" gap={1}>
              <Text variant="title-4" weight="bold">
                {conversation.channel === 'ai-call' ? 'AI Call' : conversation.channel === 'voice-message' ? 'Voice Message' : conversation.channel.charAt(0).toUpperCase() + conversation.channel.slice(1)} Conversation
              </Text>
              <Text variant="body-2" color="neutral-faded">
                {new Date(conversation.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            {conversation.sentiment && (
              <CustomBadge color={getSentimentColor(conversation.sentiment) || 'neutral'}>
                {conversation.sentiment.charAt(0).toUpperCase() + conversation.sentiment.slice(1)}
              </CustomBadge>
            )}
          </View>

          {conversation.subject && (
            <View>
              <Text variant="body-2" weight="medium">
                Subject: {conversation.subject}
              </Text>
            </View>
          )}

          <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
            {conversation.agent && (
              <Text variant="body-2" color="neutral-faded">
                Agent: {conversation.agent}
              </Text>
            )}
            {conversation.duration && (
              <Text variant="body-2" color="neutral-faded">
                Duration: {conversation.duration} minutes
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Transcript */}
      <Card padding={6}>
        <View direction="column" gap={4}>
          <Text variant="title-5" weight="bold">
            {isEmail ? 'Email Thread' : 'Transcript'}
          </Text>
          <View
            attributes={{
              style: {
                padding: '16px',
                backgroundColor: 'var(--rs-color-neutral-surface-subtle)',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                maxHeight: '600px',
                overflowY: 'auto'
              }
            }}
          >
            <Text variant="body-2" attributes={{ style: { whiteSpace: 'pre-wrap' } }}>
              {conversation.transcript}
            </Text>
          </View>
        </View>
      </Card>

      {/* Summary */}
      {conversation.summary && (
        <Card padding={6}>
          <View direction="column" gap={3}>
            <Text variant="title-5" weight="bold">
              Summary
            </Text>
            <Text variant="body-2" color="neutral-faded">
              {conversation.summary}
            </Text>
          </View>
        </Card>
      )}

      {/* Key Stats */}
      {conversation.keyStats && Object.keys(conversation.keyStats).length > 0 && (
        <Card padding={6}>
          <View direction="column" gap={3}>
            <Text variant="title-5" weight="bold">
              Key Stats
            </Text>
            <View direction="row" gap={4} attributes={{ style: { flexWrap: 'wrap' } }}>
              {conversation.keyStats.sentiment && (
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">
                    Sentiment
                  </Text>
                  <CustomBadge color={getSentimentColor(String(conversation.keyStats.sentiment)) || 'neutral'}>
                    {String(conversation.keyStats.sentiment).charAt(0).toUpperCase() + String(conversation.keyStats.sentiment).slice(1)}
                  </CustomBadge>
                </View>
              )}
              {conversation.keyStats.duration && (
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">
                    Duration
                  </Text>
                  <Text variant="body-2">{conversation.keyStats.duration} minutes</Text>
                </View>
              )}
              {conversation.keyStats.wordCount && (
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">
                    Word Count
                  </Text>
                  <Text variant="body-2">{conversation.keyStats.wordCount}</Text>
                </View>
              )}
              {conversation.keyStats.talkToListenRatio && (
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">
                    Talk/Listen Ratio
                  </Text>
                  <Text variant="body-2">{String(conversation.keyStats.talkToListenRatio)}</Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Insights */}
      {conversation.insights && conversation.insights.length > 0 && (
        <Card padding={6}>
          <View direction="column" gap={3}>
            <Text variant="title-5" weight="bold">
              Insights
            </Text>
            <View direction="column" gap={2}>
              {conversation.insights.map((insight, index) => (
                <Text key={index} variant="body-2" color="neutral-faded">
                  • {insight}
                </Text>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Coaching Suggestions */}
      {conversation.coachingSuggestions && conversation.coachingSuggestions.length > 0 && (
        <Card padding={6}>
          <View direction="column" gap={3}>
            <Text variant="title-5" weight="bold">
              Coaching Suggestions
            </Text>
            <View direction="column" gap={2}>
              {conversation.coachingSuggestions.map((suggestion, index) => (
                <Text key={index} variant="body-2" color="neutral-faded">
                  • {suggestion}
                </Text>
              ))}
            </View>
          </View>
        </Card>
      )}
    </View>
  )
}
