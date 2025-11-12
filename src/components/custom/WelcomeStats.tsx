import { Text, View, Grid, Icon } from 'reshaped'
import { MetricCard } from './MetricCard'
import { ContainerCard } from './ContainerCard'
import { Users, Lightning, WarningCircle, HandWavingIcon } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'

export interface WelcomeStatsProps {
  userName?: string
  customersAnalyzed: number
  actionPlansCreated: number
  urgentActionPlans: number
  onCustomersAnalyzedClick?: () => void
  onActionPlansCreatedClick?: () => void
  onUrgentActionPlansClick?: () => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WelcomeStats({
  userName,
  customersAnalyzed,
  actionPlansCreated,
  urgentActionPlans,
  onCustomersAnalyzedClick,
  onActionPlansCreatedClick,
  onUrgentActionPlansClick
}: WelcomeStatsProps) {
  const { user } = useAuthStore()
  const displayName = userName || user?.name || 'User'
  const greeting = getGreeting()

  return (
    <ContainerCard padding={6}>
      <View direction="column" gap={6}>
        <View direction="column" gap={2}>
          <View direction="row" gap={2} align="center">
            <Icon svg={<HandWavingIcon weight='fill' />} size={5} />
            <h3>{greeting}, {displayName.split(' ')[0]}!</h3>
          </View>
          <Text variant="body-2" color="neutral-faded">
            Here's what's happening with your customer interactions today.
          </Text>
        </View>

        <Grid columns={{ s: 1, m: 3 }} gap={4}>
          <MetricCard
            value={customersAnalyzed}
            label="Customers analyzed"
            secondaryLabel="(24h)"
            icon={Users}
            iconColor="#3b82f6"
            onClick={onCustomersAnalyzedClick}
          />
          <MetricCard
            value={actionPlansCreated}
            label="Active action plans"
            icon={Lightning}
            iconColor="#8b5cf6"
            iconWeight="fill"
            onClick={onActionPlansCreatedClick}
          />
          <MetricCard
            value={urgentActionPlans}
            label="Urgent action plans"
            icon={WarningCircle}
            iconColor="#ef4444"
            onClick={onUrgentActionPlansClick}
          />
        </Grid>
      </View>
    </ContainerCard>
  )
}
