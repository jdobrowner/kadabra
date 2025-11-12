import type React from 'react'
import { Card, Text, View, Icon } from 'reshaped'
import { CustomBadge } from './Badge'
import { ActNowButton } from './ActNowButton'
import { Phone, VideoCamera, Envelope, ChatCircle, Robot, Microphone } from '@phosphor-icons/react'
import type { Communication } from './CommunicationChannels'
import { formatRelativeTime } from '../../utils/formatTime'

export interface CustomerCardCompactProps {
  id: string
  name: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  communications: Communication[]
  topic: string
  actionPlanId?: string | null
  onActNow?: (actionPlanId: string, customerId: string) => void
}

function getBadgeColor(badge: CustomerCardCompactProps['badge']): 'primary' | 'critical' | 'positive' | 'warning' | 'neutral' | null {
  switch (badge) {
    case 'at-risk':
      return 'critical'
    case 'opportunity':
      return 'warning'
    case 'lead':
      return 'positive'
    case 'follow-up':
      return 'primary'
    case 'no-action':
      return null
    default:
      return null
  }
}

function getBadgeLabel(badge: CustomerCardCompactProps['badge']): string {
  switch (badge) {
    case 'at-risk':
      return 'At-Risk'
    case 'opportunity':
      return 'Opportunity'
    case 'lead':
      return 'Lead'
    case 'follow-up':
      return 'Follow-Up'
    default:
      return ''
  }
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

function getMostRecentCommunication(communications: Communication[]): Communication | null {
  if (communications.length === 0) return null
  const sorted = [...communications].sort((a, b) => {
    const aDate = new Date(a.lastTime).getTime()
    const bDate = new Date(b.lastTime).getTime()
    return bDate - aDate // Most recent first (larger timestamp)
  })
  return sorted[0]
}

export function CustomerCardCompact({
  id,
  name,
  badge,
  communications,
  topic,
  actionPlanId,
  onActNow
}: CustomerCardCompactProps) {
  const badgeColor = getBadgeColor(badge)
  const badgeLabel = getBadgeLabel(badge)
  const mostRecentComm = getMostRecentCommunication(communications)
  const MostRecentIconComponent = mostRecentComm ? getCommunicationIcon(mostRecentComm.type) : Phone
  const mostRecentTime = mostRecentComm?.lastTime 
    ? formatRelativeTime(mostRecentComm.lastTime)
    : ''
  const hasActionPlan = Boolean(actionPlanId)
  const handleActNowClick: ((e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void) | undefined = hasActionPlan
    ? (event) => {
        event.stopPropagation()
        if (actionPlanId) {
          onActNow?.(actionPlanId, id)
        }
      }
    : undefined

  return (
    <Card attributes={{ style: { padding: '12px 16px' } }}>
      <View direction="row" gap={4} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
        <View direction="row" gap={4} align="center" attributes={{ style: { flex: 1, minWidth: 0 } }}>
          <View direction="column" gap={1} attributes={{ style: { flex: 1, minWidth: 0 } }}>
            <View direction="row" gap={3} align="center">
              <Text variant="title-6">
                {name}
              </Text>
              {badgeColor && (
                <CustomBadge 
                  color={badgeColor}
                  badgeType={badge}
                  size="small"
                >
                  {badgeLabel}
                </CustomBadge>
              )}
            </View>
            <View direction="row" gap={1} align="center">
              <View direction="row" gap={1} align="center">
              <Icon svg={<MostRecentIconComponent weight="fill" />} attributes={{ style: { color: 'var(--rs-color-foreground-neutral-faded)', marginRight: '2px' } }} />
              <Text variant="body-2" color="neutral-faded">
                {mostRecentTime}
              </Text>
              </View>
              <Text variant="body-2" color="neutral-faded">
                • {topic}
              </Text>
            </View>
          </View>
        </View>

        {hasActionPlan && (
          <View attributes={{ style: { flexShrink: 0 } }}>
            <ActNowButton
              iconOnly
              size="small"
              onClick={handleActNowClick}
              aria-label={`Act now for ${name}`}
            />
          </View>
        )}
      </View>
    </Card>
  )
}
