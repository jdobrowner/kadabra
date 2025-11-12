import { Card, Text, View, Button } from 'reshaped'
import { ListChecks, ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export interface ActionPlanCardProps {
  actionPlanId?: string
  customerId?: string
  hasActionPlan: boolean
  status?: 'active' | 'completed'
}

export function ActionPlanCard({
  actionPlanId,
  customerId,
  hasActionPlan,
  status
}: ActionPlanCardProps) {
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

  return (
    <Card padding={6}>
      <View direction="column" gap={3}>
        <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
          <View direction="row" gap={2} align="center">
            <ListChecks size={20} weight="bold" />
            <Text variant="title-5" weight="bold">
              Action Plan
            </Text>
            {status && (
              <Text variant="caption-1" color={status === 'completed' ? 'positive' : 'neutral-faded'}>
                {status === 'completed' ? 'Completed' : 'Active'}
              </Text>
            )}
          </View>
          <Link to={actionPlanId ? `/action-plans/${actionPlanId}` : customerId ? `/customers/${customerId}` : '#'}>
            <Button size="small" variant="outline" icon={<ArrowRight />}>
              View Plan
            </Button>
          </Link>
        </View>
        <Text variant="body-2" color="neutral-faded">
          {status === 'completed' 
            ? 'This action plan has been completed.'
            : 'View and manage this customer\'s action plan.'}
        </Text>
      </View>
    </Card>
  )
}
