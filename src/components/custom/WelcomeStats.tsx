import { View, Grid } from 'reshaped'
import { MetricCard } from './MetricCard'
import { Users, Lightning, WarningCircle } from '@phosphor-icons/react'

export interface WelcomeStatsProps {
  customersAnalyzed: number
  actionPlansCreated: number
  urgentActionPlans: number
  onCustomersAnalyzedClick?: () => void
  onActionPlansCreatedClick?: () => void
  onUrgentActionPlansClick?: () => void
}

export function WelcomeStats({
  customersAnalyzed,
  actionPlansCreated,
  urgentActionPlans,
  onCustomersAnalyzedClick,
  onActionPlansCreatedClick,
  onUrgentActionPlansClick
}: WelcomeStatsProps) {
  return (
    <Grid columns={{ s: 1, m: 3 }} gap={4}>
      <MetricCard
        value={customersAnalyzed}
        label="Customers analyzed"
        secondaryLabel="(24h)"
        icon={Users}
        iconColor="#3b82f6"
        backgroundColor="rgba(59, 130, 246, 0.1)" // Pale blue matching icon color
        onClick={onCustomersAnalyzedClick}
      />
      <MetricCard
        value={actionPlansCreated}
        label="Active action plans"
        icon={Lightning}
        iconColor="#8b5cf6"
        iconWeight="fill"
        backgroundColor="rgba(139, 92, 246, 0.1)" // Pale purple matching icon color
        onClick={onActionPlansCreatedClick}
      />
      <MetricCard
        value={urgentActionPlans}
        label="Urgent action plans"
        icon={WarningCircle}
        iconColor="#ef4444"
        backgroundColor="rgba(239, 68, 68, 0.1)" // Pale red matching icon color
        onClick={onUrgentActionPlansClick}
      />
    </Grid>
  )
}
