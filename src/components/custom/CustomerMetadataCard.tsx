import { Card, Text, View } from 'reshaped'
import { CustomBadge } from './Badge'
import { AvatarWithInitials } from './AvatarWithInitials'
import { Phone, Envelope } from '@phosphor-icons/react'

export interface CustomerMetadataCardProps {
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  avatar: string
  status?: string
}

function getBadgeColor(badge: CustomerMetadataCardProps['badge']): 'primary' | 'critical' | 'positive' | 'warning' | 'neutral' | null {
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

function getBadgeLabel(badge: CustomerMetadataCardProps['badge']): string {
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

export function CustomerMetadataCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  name,
  companyName,
  email,
  phone,
  badge,
  avatar,
  status
}: CustomerMetadataCardProps) {
  const badgeColor = getBadgeColor(badge)
  const badgeLabel = getBadgeLabel(badge)

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        <View direction="row" gap={4} align="center">
          <AvatarWithInitials src={avatar} alt={name} name={name} size={16} />
          <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
            <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              <Text variant="title-3" weight="bold">
                {name}
              </Text>
              {badgeColor && (
                <CustomBadge color={badgeColor} badgeType={badge}>
                  {badgeLabel}
                </CustomBadge>
              )}
            </View>
            <Text variant="body-2" color="neutral-faded">
              {companyName}
            </Text>
          </View>
        </View>

        {(email || phone) && (
          <View direction="column" gap={2}>
            {email && (
              <View direction="row" gap={2} align="center">
                <Envelope size={16} />
                <Text variant="body-2">{email}</Text>
              </View>
            )}
            {phone && (
              <View direction="row" gap={2} align="center">
                <Phone size={16} />
                <Text variant="body-2">{phone}</Text>
              </View>
            )}
          </View>
        )}

        {status && (
          <View>
            <Text variant="body-2" color="neutral-faded">
              Status: <Text weight="medium" as="span" color="neutral">{status}</Text>
            </Text>
          </View>
        )}
      </View>
    </Card>
  )
}
