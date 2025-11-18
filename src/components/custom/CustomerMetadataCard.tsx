import { Card, Text, View, Button, Icon } from 'reshaped'
import { Phone, Envelope, DotsThree } from '@phosphor-icons/react'
import { CustomBadge } from './Badge'

export interface CustomerMetadataCardProps {
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  avatar: string
}

export function CustomerMetadataCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  name: _name, // eslint-disable-line @typescript-eslint/no-unused-vars
  companyName: _companyName, // eslint-disable-line @typescript-eslint/no-unused-vars
  email,
  phone,
  badge: _badge, // eslint-disable-line @typescript-eslint/no-unused-vars
  avatar: _avatar // eslint-disable-line @typescript-eslint/no-unused-vars
}: CustomerMetadataCardProps) {
  return (
    <Card padding={6} attributes={{ style: { position: 'relative' } }}>
      {/* Top right: Salesforce badge and 3 dots menu */}
      <View 
        direction="row" 
        gap={2} 
        align="center"
        attributes={{
          style: {
            position: 'absolute',
            top: '16px',
            right: '22px',
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        <CustomBadge color="primary">
          Synced to Salesforce
        </CustomBadge>
        <Button
          variant="ghost"
          icon={<Icon svg={<DotsThree weight="bold" />} size={6} />}
          attributes={{
            'aria-label': 'More options',
            style: {
              padding: '8px'
            }
          }}
        />
      </View>

      <View direction="column" gap={4}>
        {/* Contact info */}
        {(email || phone) && (
          <View direction="column" gap={2}>
            <h3 style={{ margin: 0 }}>Contact Info</h3>
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
      </View>
    </Card>
  )
}
