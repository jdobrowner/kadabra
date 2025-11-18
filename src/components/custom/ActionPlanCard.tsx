import { Card, Text, View } from 'reshaped'
import { ListChecks } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { ActNowButton } from './ActNowButton'

export interface ActionPlanCardProps {
  actionPlanId?: string
  customerId?: string
  hasActionPlan: boolean
  status?: 'active' | 'completed'
  aiRecommendation?: string
}

export function ActionPlanCard({
  actionPlanId,
  customerId,
  hasActionPlan,
  status,
  aiRecommendation
}: ActionPlanCardProps) {
  const navigate = useNavigate()

  if (!hasActionPlan) {
    return (
      <Card padding={6}>
        <View direction="column" gap={3} align="center">
          <ListChecks size={32} weight="bold" />
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

  return (
    <Card padding={6}>
      <View direction="column" gap={3}>
        <View direction="row" gap={2} align="center">
          <ListChecks size={20} weight="bold" />
          <Text variant="title-5" weight="bold">
            Action Plan
          </Text>
        </View>
        {aiRecommendation && (
          <Text variant="body-1" weight="medium">
            {aiRecommendation}
          </Text>
        )}
        <View direction="row" justify="end">
          <ActNowButton 
            size="small" 
            onClick={handleActNow}
            disabled={!actionPlanId || !customerId}
          />
        </View>
      </View>
    </Card>
  )
}
