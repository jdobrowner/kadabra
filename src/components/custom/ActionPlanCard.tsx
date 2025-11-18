import { Card, Text, View, Icon } from 'reshaped'
import { Lightning, Clock } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { ActNowButton } from './ActNowButton'
import { formatRelativeTime } from '../../utils/formatTime'

export interface ActionPlanCardProps {
  actionPlanId?: string
  customerId?: string
  hasActionPlan: boolean
  status?: 'active' | 'completed'
  aiRecommendation?: string
  actionItems?: Array<{
    id: string
    type: string
    title: string
    description: string
    status: string
  }>
  createdAt?: string
}

export function ActionPlanCard({
  actionPlanId,
  customerId,
  hasActionPlan,
  status,
  aiRecommendation,
  actionItems = [],
  createdAt
}: ActionPlanCardProps) {
  const navigate = useNavigate()

  if (!hasActionPlan) {
    return (
      <Card padding={6}>
        <View direction="column" gap={3} align="center">
          <Icon svg={<Lightning weight="bold" />} size={8} />
          <Text variant="body-2" color="neutral-faded">
            No action plan
          </Text>
        </View>
      </Card>
    )
  }

  const handleActNow = () => {
    if (actionPlanId && customerId) {
      navigate(`/triage/customers/${customerId}/action-plans/${actionPlanId}`)
    } else if (customerId) {
      navigate(`/triage/customers/${customerId}`)
    }
  }

  // Calculate action item stats
  const totalItems = actionItems.length
  const completedItems = actionItems.filter(item => item.status === 'completed' || item.status === 'done').length
  const pendingItems = totalItems - completedItems

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        <View direction="column" gap={2}>
          <View direction="row" gap={2} align="center">
            <Icon svg={<Lightning weight="fill" />} size={5} />
            <h3 style={{ margin: 0 }}>Action Plan</h3>
          </View>
          {aiRecommendation && (
            <Text variant="body-2" color="neutral-faded">
              {aiRecommendation}
            </Text>
          )}
        </View>

        {(totalItems > 0 || createdAt) && (
          <View direction="row" gap={3} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
            {totalItems > 0 && (
              <>
                <View direction="row" gap={1} align="center">
                  <Text variant="body-2" color="neutral-faded">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </Text>
                  {completedItems > 0 && (
                    <>
                      <Text variant="body-2" color="neutral-faded">•</Text>
                      <Text variant="body-2" color="neutral-faded">
                        {completedItems} completed
                      </Text>
                    </>
                  )}
                  {pendingItems > 0 && (
                    <>
                      <Text variant="body-2" color="neutral-faded">•</Text>
                      <Text variant="body-2" color="neutral-faded">
                        {pendingItems} pending
                      </Text>
                    </>
                  )}
                </View>
              </>
            )}
            {createdAt && (
              <>
                {totalItems > 0 && <Text variant="body-2" color="neutral-faded">•</Text>}
                <View direction="row" gap={1} align="center">
                  <Icon svg={<Clock weight="bold" />} size={4} />
                  <Text variant="body-2" color="neutral-faded">
                    Created {formatRelativeTime(createdAt)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        <View direction="row" justify="end">
          <ActNowButton 
            onClick={handleActNow}
            disabled={!actionPlanId || !customerId}
          />
        </View>
      </View>
    </Card>
  )
}
