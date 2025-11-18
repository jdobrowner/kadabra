import { Card, Text, View } from 'reshaped'
import { Phone, Envelope } from '@phosphor-icons/react'
import { formatRelativeTime } from '../../utils/formatTime'

export interface CustomerMetadataCardProps {
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  avatar: string
  riskScore?: number
  opportunityScore?: number
  totalConversations?: number
  totalTasks?: number
  totalActionPlans?: number
  createdAt?: string
  updatedAt?: string
}

export function CustomerMetadataCard({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  name: _name, // eslint-disable-line @typescript-eslint/no-unused-vars
  companyName: _companyName, // eslint-disable-line @typescript-eslint/no-unused-vars
  email,
  phone,
  badge: _badge, // eslint-disable-line @typescript-eslint/no-unused-vars
  avatar: _avatar, // eslint-disable-line @typescript-eslint/no-unused-vars
  riskScore,
  opportunityScore,
  totalConversations,
  totalTasks,
  totalActionPlans,
  createdAt,
  updatedAt
}: CustomerMetadataCardProps) {
  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
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

        {(riskScore !== undefined || opportunityScore !== undefined) && (
          <View direction="column" gap={2}>
            {riskScore !== undefined && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Risk Score
                </Text>
                <Text variant="body-2" weight="medium">
                  {riskScore}
                </Text>
              </View>
            )}
            {opportunityScore !== undefined && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Opportunity Score
                </Text>
                <Text variant="body-2" weight="medium">
                  {opportunityScore}
                </Text>
              </View>
            )}
          </View>
        )}

        {(totalConversations !== undefined || totalTasks !== undefined || totalActionPlans !== undefined) && (
          <View direction="column" gap={2}>
            {totalConversations !== undefined && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Total Conversations
                </Text>
                <Text variant="body-2" weight="medium">
                  {totalConversations}
                </Text>
              </View>
            )}
            {totalTasks !== undefined && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Total Tasks
                </Text>
                <Text variant="body-2" weight="medium">
                  {totalTasks}
                </Text>
              </View>
            )}
            {totalActionPlans !== undefined && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Total Action Plans
                </Text>
                <Text variant="body-2" weight="medium">
                  {totalActionPlans}
                </Text>
              </View>
            )}
          </View>
        )}

        {(createdAt || updatedAt) && (
          <View direction="column" gap={2}>
            {createdAt && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Created
                </Text>
                <Text variant="body-2" color="neutral-faded">
                  {formatRelativeTime(createdAt)}
                </Text>
              </View>
            )}
            {updatedAt && (
              <View direction="row" gap={2} align="center" justify="space-between">
                <Text variant="body-2" color="neutral-faded">
                  Last Updated
                </Text>
                <Text variant="body-2" color="neutral-faded">
                  {formatRelativeTime(updatedAt)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  )
}
