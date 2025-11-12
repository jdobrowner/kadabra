import { Card, Text, View, Grid } from 'reshaped'
import { MetricCard } from './MetricCard'
import { Users, ListChecks, WarningCircle } from '@phosphor-icons/react'

export interface DashboardStatsProps {
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

export function DashboardStats({
  userName = 'Sarah',
  customersAnalyzed,
  actionPlansCreated,
  urgentActionPlans,
  onCustomersAnalyzedClick,
  onActionPlansCreatedClick,
  onUrgentActionPlansClick
}: DashboardStatsProps) {
  const greeting = getGreeting()

  return (
    <Card padding={6}>
      <View direction="column" gap={6}>
        <View direction="column" gap={2}>
          <Text variant="featured-2" weight="bold">
            {greeting}, {userName}!
          </Text>
          <Text variant="body-2" color="neutral-faded">
            Here's what's happening with your customer interactions today.
          </Text>
        </View>

        <Grid columns={{ s: 1, m: 3 }} gap={4}>
          <MetricCard
            value={customersAnalyzed}
            label="Customers analyzed"
            icon={Users}
            iconColor="primary"
            onClick={onCustomersAnalyzedClick}
          />
          <MetricCard
            value={actionPlansCreated}
            label="Active action plans"
            icon={ListChecks}
            iconColor="positive"
            onClick={onActionPlansCreatedClick}
          />
          <MetricCard
            value={urgentActionPlans}
            label="Urgent action plans"
            icon={WarningCircle}
            iconColor="warning"
            onClick={onUrgentActionPlansClick}
          />
        </Grid>
      </View>
    </Card>
  )
}

