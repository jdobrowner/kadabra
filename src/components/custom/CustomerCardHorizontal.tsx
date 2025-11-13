import type React from 'react'
import { Text, View } from 'reshaped'
import { RowCard } from './RowCard'
import { CustomBadge } from './Badge'
import { ActNowButton } from './ActNowButton'
import { CommunicationChannels, type Communication } from './CommunicationChannels'
import { AvatarWithInitials } from './AvatarWithInitials'

export interface CustomerCardHorizontalProps {
  id: string
  name: string
  companyName: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  communications: Communication[]
  topic: string
  aiRecommendation: string
  avatar: string
  actionPlanId?: string | null
  onActNow?: (actionPlanId: string, customerId: string) => void
  noBorderBottom?: boolean
}

function getBadgeColor(badge: CustomerCardHorizontalProps['badge']): 'primary' | 'critical' | 'positive' | 'warning' | 'neutral' | null {
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

function getBadgeLabel(badge: CustomerCardHorizontalProps['badge']): string {
  switch (badge) {
    case 'at-risk':
      return 'At-Risk'
    case 'opportunity':
      return 'Opportunity'
    case 'lead':
      return 'Potential Lead'
    case 'follow-up':
      return 'Follow-Up'
    default:
      return ''
  }
}


export function CustomerCardHorizontal({
  id,
  name,
  companyName,
  badge,
  communications,
  topic,
  avatar,
  actionPlanId,
  onActNow,
  noBorderBottom = false
}: CustomerCardHorizontalProps) {
  const badgeColor = getBadgeColor(badge)
  const badgeLabel = getBadgeLabel(badge)
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
    <RowCard padding={8} noBorderBottom={noBorderBottom}>
      <View direction="row" gap={6} align="center" attributes={{ style: { justifyContent: 'space-between', alignItems: 'center' } }}>
        <View direction="row" gap={4} align="center" attributes={{ style: { flex: '0 0 auto', minWidth: 0 } }}>
          <AvatarWithInitials src={avatar} alt={name} name={name} size={12} />
          <View direction="column" gap={2}>
            <View direction="row" gap={1} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              <Text variant="title-5">
                {name}
              </Text>
              <Text variant="body-2" color="neutral-faded">•</Text>
              <Text variant="body-2" color="neutral-faded" attributes={{ style: { paddingRight: '10px' } }}>
                {companyName}
              </Text>
              {badgeColor && (
                <CustomBadge color={badgeColor} badgeType={badge}>
                  {badgeLabel}
                </CustomBadge>
              )}
            </View>
            <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              <CommunicationChannels communications={communications} textColor="neutral-faded" />
              <Text variant="body-2" color="neutral">•</Text>
              <Text variant="body-2" color="neutral">
                {topic}
              </Text>
            </View>
          </View>
        </View>

        {hasActionPlan && (
          <View attributes={{ style: { flexShrink: 0 } }}>
            <ActNowButton
              onClick={handleActNowClick}
              aria-label={`Act now for ${name}`}
            />
          </View>
        )}
      </View>
    </RowCard>
  )
}
