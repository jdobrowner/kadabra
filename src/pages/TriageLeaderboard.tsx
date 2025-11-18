import { Container, View, Grid, Text } from 'reshaped'
import { FilterBox } from '../components/custom/FilterBox'
import { CustomerCard } from '../components/custom/CustomerCard'
import { PageHeader } from '../components/custom/PageHeader'
import { useCustomersStore } from '../store/useCustomersStore'
import type { CustomerBadgeFilter, CustomerAssigneeFilter, CustomerTimeframeFilter, CustomerSortOption } from '../store/useCustomersStore'
import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TriageLeaderboard() {
  const navigate = useNavigate()
  
  // Get customers and filters from store
  const customers = useCustomersStore((state) => state.customers)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const customersFilters = useCustomersStore((state) => state.customersFilters)
  const setCustomersFilters = useCustomersStore((state) => state.setCustomersFilters)
  const resetCustomersFilters = useCustomersStore((state) => state.resetCustomersFilters)
  
  // Fetch customers when filters change
  const { badge, timeframe, sortBy, assignee } = customersFilters
  useEffect(() => {
    fetchCustomers({ badge, timeframe, sortBy, assignee })
  }, [badge, timeframe, sortBy, assignee, fetchCustomers])

  const handleClearFilters = () => {
    resetCustomersFilters()
  }

  const handleCustomerClick = useCallback((customerId: string) => {
    navigate(`/customers/${customerId}`)
  }, [navigate])

  const handleActNow = useCallback((actionPlanId: string, _customerId?: string) => {
    navigate(`/action-plans/${actionPlanId}`)
  }, [navigate])

  return (
    <Container>
      <View direction="column" gap={6}>
        <PageHeader
          title="Call Triage Leaderboard"
          subtitle="Prioritize customer calls by urgency and opportunity to maximize your team's impact"
        />

        <FilterBox
          priorityFilter={customersFilters.badge}
          assigneeFilter={customersFilters.assignee}
          timeframeFilter={customersFilters.timeframe}
          rankingOption={customersFilters.sortBy}
          onPriorityChange={(value) => setCustomersFilters({ badge: (value as CustomerBadgeFilter) || 'all' })}
          onAssigneeChange={(value) =>
            setCustomersFilters({ assignee: ((value || 'all') as CustomerAssigneeFilter) })
          }
          onTimeframeChange={(value) => setCustomersFilters({ timeframe: (value as CustomerTimeframeFilter) || 'all' })}
          onRankingChange={(value) => setCustomersFilters({ sortBy: value as CustomerSortOption })}
          onClear={handleClearFilters}
        />

        <Grid 
          columns={{ s: 1, m: 2, l: 3 }} 
          gap={4} 
          attributes={{ 
            style: { 
              alignItems: 'stretch',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
            } 
          }}
        >
              {customers
                .filter(customer => customer.actionPlan?.id) // Only show customers with action plans
                .map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer.id)}
              style={{ cursor: 'pointer', display: 'flex', height: '100%' }}
                >
                  <CustomerCard
                    id={customer.id}
                    name={customer.name}
                    companyName={customer.companyName}
                  badge={(customer.actionPlan?.badge as any) || 'no-action'}
                  communications={customer.communications as any}
                    topic={customer.lastCommunication?.topic || 'No recent communication'}
                    longTopic={customer.lastCommunication?.longTopic || 'No recent communication'}
                    aiRecommendation={customer.actionPlan?.aiRecommendation || 'No recommendation'}
                    avatar={customer.avatar}
                    actionPlanId={customer.actionPlan?.id || undefined}
                    onActNow={handleActNow}
                  />
                </div>
              ))}
            </Grid>

            {customers.filter(customer => customer.actionPlan?.id).length === 0 && (
              <View attributes={{ style: { textAlign: 'center', padding: '40px' } }}>
                <Text color="neutral-faded">No customers found matching your filters.</Text>
              </View>
        )}
      </View>
    </Container>
  )
}
