import { Container, View, Button, Text, Icon } from 'reshaped'
import { WelcomeStats } from '../components/custom/WelcomeStats'
import { CustomerCardHorizontal } from '../components/custom/CustomerCardHorizontal'
import { MiniCalendar } from '../components/custom/MiniCalendar'
import { MiniKanban } from '../components/custom/MiniKanban'
import { ContainerCard } from '../components/custom/ContainerCard'
import { useDashboardStore } from '../store/useDashboardStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Lightning } from '@phosphor-icons/react'
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
      <div className="dashboard-grid">
        {/* Left Column - 2x width */}
        <div className="dashboard-left-column">
          <WelcomeStats
            customersAnalyzed={customersAnalyzed}
            actionPlansCreated={actionPlansCreated}
            urgentActionPlans={urgentActionPlans}
          />

          {/* Customer Triage Leaderboard Card */}
          <ContainerCard padding={6}>
            <View direction="column" gap={4}>
              <View direction="column" gap={2}>
                <View direction="row" gap={2} align="center">
                  <div>
                    <Icon svg={<Lightning weight='fill' />} size={5} />
                  </div>
                  <h3 style={{ margin: 0 }}>Customer Triage Leaderboard</h3>
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

              <Link to="/triage" style={{ width: '100%' }}>
                <Button attributes={{ style: { width: '100%' } }} size="large" variant="solid" color="primary">
                  View All →
                </Button>
              </Link>
            </View>
          </ContainerCard>
        </div>

        {/* Right Column - 1x width */}
        <div className="dashboard-right-column">
          <MiniCalendar />
          <MiniKanban />
        </div>
      </div>
    </Container>
  )
}
