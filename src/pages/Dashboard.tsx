import { Container, View, Text, Icon, Card } from 'reshaped'
import { WelcomeStats } from '../components/custom/WelcomeStats'
import { PageHeader } from '../components/custom/PageHeader'
import { CustomerCardHorizontal } from '../components/custom/CustomerCardHorizontal'
import { MiniReminders } from '../components/custom/MiniReminders'
import { MiniKanban } from '../components/custom/MiniKanban'
import { SecondaryButton } from '../components/custom/SecondaryButton'
import { GhostButton } from '../components/custom/GhostButton'
import { useDashboardStore } from '../store/useDashboardStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Lightning, Plus, ArrowRight } from '@phosphor-icons/react'
import './Dashboard.css'

export default function Dashboard() {
  // Get dashboard stats from store
  const stats = useDashboardStore((state) => state.stats)
  const fetchStats = useDashboardStore((state) => state.fetchStats)
  
  // Get customers from store
  const customers = useCustomersStore((state) => state.customers)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const navigate = useNavigate()

  // Fetch data on mount (StoreSubscriptions handles real-time updates via WebSocket)
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchStats(),
        fetchCustomers({ sortBy: 'priority' })
      ])
    }

    fetchData()
  }, [fetchStats, fetchCustomers])
  
  const customersAnalyzed = stats?.customersAnalyzed ?? 0
  const actionPlansCreated = stats?.actionPlansCreated ?? 0
  const urgentActionPlans = stats?.urgentActionPlans ?? 0
  
  // Get first 3 customers for preview
  const previewCustomers = customers.slice(0, 3)
  const remainingCount = Math.max(0, customers.length - 3)

  const handleActNow = useCallback((actionPlanId: string, _customerId?: string) => {
    navigate(`/action-plans/${actionPlanId}`)
  }, [navigate])

  return (
    <Container>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="dashboard-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5a77eb" />
            <stop offset="40%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Page Header */}
      <View direction="column" gap={6} attributes={{ style: { marginBottom: '24px' } }}>
        <PageHeader />
      </View>

      <div className="dashboard-grid">
        {/* Row 1: Stats Cards - 3 columns */}
        <div className="dashboard-stats-row">
          <WelcomeStats
            customersAnalyzed={customersAnalyzed}
            actionPlansCreated={actionPlansCreated}
            urgentActionPlans={urgentActionPlans}
          />
        </div>

        {/* Row 2: Triage Leaderboard - 2 columns */}
        <div className="dashboard-triage-card">
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="column" gap={2}>
                <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between', width: '100%' } }}>
                  <View direction="row" gap={2} align="center">
                    <div>
                      <Icon svg={<Lightning weight='fill' />} size={5} />
                    </div>
                    <h3 style={{ margin: 0 }}>Customer Triage Leaderboard</h3>
                  </View>
                  <Link to="/triage">
                    <GhostButton>
                      <View direction="row" gap={2} align="center">
                        <Text>View All</Text>
                        <Icon svg={<ArrowRight weight="bold" />} size={4} />
                      </View>
                    </GhostButton>
                  </Link>
                </View>
                <Text variant="body-2" color="neutral-faded">
                  Top 3 to act on today
                </Text>
              </View>

              <View direction="column" gap={3}>
                {previewCustomers.map((customer, index) => (
                  <CustomerCardHorizontal
                    key={customer.id}
                    id={customer.id}
                    name={customer.name}
                    companyName={customer.companyName}
                    badge={(customer.actionPlan?.badge as any) || 'no-action'}
                    communications={customer.communications as any}
                    topic={customer.lastCommunication?.topic || 'No recent communication'}
                    aiRecommendation={customer.actionPlan?.aiRecommendation || 'No recommendation'}
                    avatar={customer.avatar}
                    actionPlanId={customer.actionPlan?.id || undefined}
                    onActNow={handleActNow}
                    noBorderBottom={index === previewCustomers.length - 1}
                  />
                ))}
              </View>

              {remainingCount > 0 && (
                <Link to="/triage" style={{ width: '100%' }}>
                  <SecondaryButton
                    attributes={{ 
                      style: { width: '100%' },
                      'data-icon-size': '16px'
                    } as any}
                    size="large"
                    color="primary"
                    icon={<Plus weight="bold" />}
                  >
                    {remainingCount} more
                  </SecondaryButton>
                </Link>
              )}
            </View>
          </Card>
        </div>

        {/* Row 2: Right Column - 1 column (Calendar) */}
        <div className="dashboard-right-column">
          <MiniReminders />
        </div>

        {/* Row 3: Kanban - 1 column (positioned in 3rd column) */}
        <div className="dashboard-kanban-card">
          <MiniKanban />
        </div>
      </div>
    </Container>
  )
}
