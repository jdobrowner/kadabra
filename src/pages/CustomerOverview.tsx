import { Container, View, Button, Icon } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ChatCircle, ArrowRight } from '@phosphor-icons/react'
import { CustomerMetadataCard } from '../components/custom/CustomerMetadataCard'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { Card, Text } from 'reshaped'
import { useAppStore } from '../store/useAppStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useEffect, useRef } from 'react'
import { formatRelativeTime } from '../utils/formatTime'
import { CommunicationChannels } from '../components/custom/CommunicationChannels'
import { CustomerPageHeader } from '../components/custom/CustomerPageHeader'

// Stable empty array reference to prevent infinite loops in Zustand selectors
const EMPTY_ARRAY: never[] = []

export default function CustomerOverview() {
  const { customerId } = useParams<{ customerId: string }>()
  const setActiveCustomer = useAppStore((state) => state.setActiveCustomer)
  
  // Get customer from store
  const customer = useCustomersStore((state) => state.currentCustomer)
  const customerLoading = useCustomersStore((state) => state.currentCustomerLoading)
  const fetchCustomer = useCustomersStore((state) => state.fetchCustomer)
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const actionPlanLoading = useActionPlansStore((state) => state.currentActionPlanLoading)
  const fetchActionPlanByCustomerId = useActionPlansStore((state) => state.fetchActionPlanByCustomerId)
  
  // Get conversations from store - use stable empty array reference to prevent infinite loops
  const conversations = useConversationsStore((state) => 
    customerId ? (state.conversationsByCustomer[customerId] ?? EMPTY_ARRAY) : EMPTY_ARRAY
  )
  const conversationsLoading = useConversationsStore((state) => 
    customerId ? (state.conversationsLoading[customerId] ?? false) : false
  )
  const fetchConversationsForCustomer = useConversationsStore((state) => state.fetchConversationsForCustomer)
  
  // const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingRef = useRef(false)
  const currentIdRef = useRef<string | null>(null)

  // Fetch data on mount (StoreSubscriptions handles real-time updates via WebSocket)
  useEffect(() => {
    if (!customerId) return
    
    // Only fetch if this is a new ID (prevent re-fetching on re-renders)
    if (currentIdRef.current === customerId) {
      return
    }
    
    currentIdRef.current = customerId

    const fetchData = async () => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      
      try {
        setActiveCustomer(customerId)
        await Promise.all([
          fetchCustomer(customerId),
          fetchActionPlanByCustomerId(customerId),
          fetchConversationsForCustomer(customerId)
        ])
      } finally {
        isFetchingRef.current = false
      }
    }

    // Initial fetch
    fetchData()

    // POLLING DISABLED - Using WebSocket subscriptions only
    // Set up polling every 45 seconds
    // pollingIntervalRef.current = setInterval(() => {
    //   // Only poll if we're not currently fetching and still on the same customer
    //   if (!isFetchingRef.current && currentIdRef.current === customerId) {
    //     fetchData()
    //   }
    // }, 45000)

    // Cleanup on unmount or when customerId changes
    return () => {
      // if (pollingIntervalRef.current) {
      //   clearInterval(pollingIntervalRef.current)
      //   pollingIntervalRef.current = null
      // }
      // Reset when customerId changes so we can fetch the new customer
      if (currentIdRef.current === customerId) {
        currentIdRef.current = null
      }
      isFetchingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]) // Only depend on customerId - Zustand functions are stable and don't need to be in deps

  const lastConversation = conversations.length > 0 ? conversations[0] : null
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const mostRecentConversation = sortedConversations.length > 0 ? sortedConversations[0] : null

  if (!customer && !customerLoading) {
    return (
      <Container>
        <View direction="column" gap={4}>
          <Text variant="body-2" color="neutral-faded">
            Customer not found
          </Text>
        </View>
      </Container>
    )
  }

  // Show content even while loading - data will appear via WebSocket updates
  if (!customer) {
    return null
  }

  return (
    <Container>
      <View direction="column" gap={6}>
        <CustomerPageHeader
          customerId={customer.id}
          name={customer.name}
          companyName={customer.companyName}
          badge={(actionPlan?.badge as any) || 'no-action'}
          avatar={customer.avatar}
        />

        <CustomerMetadataCard
          id={customer.id}
          name={customer.name}
          companyName={customer.companyName}
          email={customer.email}
          phone={customer.phone}
          badge={(actionPlan?.badge as any) || 'no-action'}
          avatar={customer.avatar}
          riskScore={customer.riskScore}
          opportunityScore={customer.opportunityScore}
          totalConversations={customer.totalConversations}
          totalTasks={customer.totalTasks}
          totalActionPlans={customer.totalActionPlans}
          createdAt={customer.createdAt}
          updatedAt={customer.updatedAt}
        />

        <ActionPlanCard
          actionPlanId={actionPlan?.id}
          customerId={customer.id}
          hasActionPlan={!!actionPlan}
          status={actionPlan?.status as any}
          aiRecommendation={customer.actionPlan?.aiRecommendation || actionPlan?.recommendation}
          actionItems={actionPlan?.actionItems}
          createdAt={actionPlan?.createdAt}
        />

        {mostRecentConversation && customer.lastCommunication && (
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="column" gap={2}>
                <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                  <h3 style={{ margin: 0 }}>Most Recent Conversation</h3>
                  <Link to={`/triage/customers/${customer.id}/conversations/${mostRecentConversation.id}`}>
                    <Button size="small" variant="outline" icon={<ArrowRight />}>
                      View
                    </Button>
                  </Link>
                </View>
                <Text variant="body-2" color="neutral-faded">
                  {customer.lastCommunication.topic || customer.lastCommunication.longTopic}
                </Text>
              </View>
              <CommunicationChannels 
                communications={customer.communications.map(comm => ({
                  type: comm.type as any,
                  count: comm.count,
                  lastTime: comm.lastTime
                }))}
                textColor="neutral-faded"
              />
            </View>
          </Card>
        )}

        <Card padding={6}>
          <View direction="column" gap={4}>
            <View direction="column" gap={2}>
              <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                <View direction="row" gap={2} align="center">
                  <ChatCircle size={20} weight="bold" />
                  <h3 style={{ margin: 0 }}>Conversation History</h3>
                </View>
                {conversations.length > 0 && (
                  <Link to={`/triage/customers/${customer.id}/conversations`}>
                    <Button size="small" variant="outline" icon={<ArrowRight />}>
                      View All
                    </Button>
                  </Link>
                )}
              </View>
              {conversations.length > 0 ? (
                <View direction="column" gap={2}>
                  <Text variant="body-2" color="neutral-faded">
                    {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'} total
                  </Text>
                  {mostRecentConversation && (
                    <>
                      <Text variant="body-2" color="neutral-faded">
                        Most recent: {formatRelativeTime(mostRecentConversation.date)}
                      </Text>
                      {mostRecentConversation.summary && (
                        <Text variant="body-2" color="neutral-faded">
                          {mostRecentConversation.summary.substring(0, 150)}...
                        </Text>
                      )}
                    </>
                  )}
                </View>
              ) : (
                <Text variant="body-2" color="neutral-faded">
                  No conversations yet
                </Text>
              )}
            </View>
          </View>
        </Card>
      </View>
    </Container>
  )
}
