import { View, Text } from 'reshaped'
import { CustomBadge } from './Badge'
import { AvatarWithInitials } from './AvatarWithInitials'

export interface CustomerPageHeaderProps {
  customerId: string
  name: string
  companyName: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  avatar: string
}

function getBadgeColor(badge: CustomerPageHeaderProps['badge']): 'primary' | 'critical' | 'positive' | 'warning' | 'neutral' | null {
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

function getBadgeLabel(badge: CustomerPageHeaderProps['badge']): string {
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

export function CustomerPageHeader({
  customerId: _customerId, // eslint-disable-line @typescript-eslint/no-unused-vars
  name,
  companyName,
  badge,
  avatar
}: CustomerPageHeaderProps) {
  const badgeColor = getBadgeColor(badge)
  const badgeLabel = getBadgeLabel(badge)

  return (
    <View direction="row" gap={4} align="center">
      <AvatarWithInitials src={avatar} alt={name} name={name} size={12} />
      <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
        <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
          <Text variant="title-2" weight="bold">
            {name}
          </Text>
          {badgeColor && (
            <CustomBadge color={badgeColor} badgeType={badge}>
              {badgeLabel}
            </CustomBadge>
          )}
        </View>
        <Text variant="body-1" color="neutral-faded">
          {companyName}
        </Text>
      </View>
    </View>
  )
}

