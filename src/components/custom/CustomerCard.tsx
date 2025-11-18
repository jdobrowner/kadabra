import type React from 'react'
import { Card, Text, View } from 'reshaped'
import { CustomBadge } from './Badge'
import { ActNowButton } from './ActNowButton'
import { CommunicationChannels, type Communication } from './CommunicationChannels'
import { AvatarWithInitials } from './AvatarWithInitials'

export interface CustomerCardProps {
  id: string
  name: string
  companyName: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  communications: Communication[]
  topic: string
  longTopic: string
  aiRecommendation: string
  avatar: string
  actionPlanId?: string | null
  onActNow?: (actionPlanId: string, customerId: string) => void
}


function getBadgeColor(badge: CustomerCardProps['badge']): 'primary' | 'critical' | 'positive' | 'warning' | 'neutral' | null {
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

function getBadgeLabel(badge: CustomerCardProps['badge']): string {
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


export function CustomerCard({
  id,
  name,
  companyName,
  badge,
  communications,
  longTopic,
  aiRecommendation,
  avatar,
  actionPlanId,
  onActNow
}: CustomerCardProps) {
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
    <Card padding={8} attributes={{ style: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <View 
        direction="column" 
        gap={4} 
        attributes={{ style: { height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        <View 
          direction="row" 
          gap={4} 
          align="start" 
          attributes={{ 
            style: { 
              position: 'relative',
              width: '100%'
            } 
          }}
        >
          <View direction="row" gap={3} align="center" attributes={{ style: { flex: 1, minWidth: 0, width: '100%' } }}>
            <AvatarWithInitials src={avatar} alt={name} name={name} size={14} />
            <View direction="column" gap={1} attributes={{ style: { flex: 1, minWidth: 0 } }}>
              <Text variant="title-5">
                {name}
              </Text>
              <Text variant="body-2" color="neutral-faded">
                {companyName}
              </Text>
            </View>
          </View>
          
          {badgeColor && badge !== 'no-action' && (
            <View attributes={{ 
              style: { 
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10
              } 
            }}>
              <CustomBadge color={badgeColor} badgeType={badge}>
                {badgeLabel}
              </CustomBadge>
            </View>
          )}
        </View>
        
        <View direction="column" gap={3} attributes={{ style: { flex: 1 } }}>
          <CommunicationChannels communications={communications} />
          
          <Text variant="body-2" color="neutral-faded">
            <Text weight="medium" as="span" color="neutral">Topic: </Text>
            {longTopic}
          </Text>
          
          <Text variant="body-2" color="neutral-faded">
            <Text weight="medium" as="span" color="neutral">AI Recommendation: </Text>
            {aiRecommendation}
          </Text>
        </View>
        
        {hasActionPlan && (
          <View attributes={{ style: { marginTop: 'auto' } }}>
            <ActNowButton
              fullWidth
              onClick={handleActNowClick}
              aria-label={`Act now for ${name}`}
            />
          </View>
        )}
      </View>
    </Card>
  )
}
