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
    <View direction="column" gap={2}>
      <View direction="row" gap={4} align="center">
        <AvatarWithInitials src={avatar} alt={name} name={name} size={12} />
        <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap', flex: 1 } }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, lineHeight: '1.2' }}>
            {name}
          </h1>
          {badgeColor && (
            <CustomBadge color={badgeColor} badgeType={badge}>
              {badgeLabel}
            </CustomBadge>
          )}
        </View>
      </View>
      <Text variant="body-1" color="neutral-faded" attributes={{ style: { fontSize: '18px' } }}>
        {companyName}
      </Text>
    </View>
  )
}

