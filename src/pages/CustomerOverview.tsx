import { Container, View, Button, Icon } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChatCircle, ArrowRight, ArrowsClockwise } from '@phosphor-icons/react'
import { CustomerMetadataCard } from '../components/custom/CustomerMetadataCard'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { Card, Text } from 'reshaped'
import { useAppStore } from '../store/useAppStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useEffect, useRef, useState } from 'react'
import { formatRelativeTime } from '../utils/formatTime'

// Stable empty array reference to prevent infinite loops in Zustand selectors
const EMPTY_ARRAY: never[] = []

export default function CustomerOverview() {
  const { id } = useParams<{ id: string }>()
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
    id ? (state.conversationsByCustomer[id] ?? EMPTY_ARRAY) : EMPTY_ARRAY
  )
  const conversationsLoading = useConversationsStore((state) => 
    id ? (state.conversationsLoading[id] ?? false) : false
  )
  const fetchConversationsForCustomer = useConversationsStore((state) => state.fetchConversationsForCustomer)
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  // const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingRef = useRef(false)
  const currentIdRef = useRef<string | null>(null)

  // Fetch data on mount (StoreSubscriptions handles real-time updates via WebSocket)
  useEffect(() => {
    if (!id) return
    
    // Only fetch if this is a new ID (prevent re-fetching on re-renders)
    if (currentIdRef.current === id) {
      return
    }
    
    currentIdRef.current = id

    const fetchData = async () => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      
      try {
        setActiveCustomer(id)
        await Promise.all([
          fetchCustomer(id),
          fetchActionPlanByCustomerId(id),
          fetchConversationsForCustomer(id)
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
    //   if (!isFetchingRef.current && currentIdRef.current === id) {
    //     fetchData()
    //   }
    // }, 45000)

    // Cleanup on unmount or when id changes
    return () => {
      // if (pollingIntervalRef.current) {
      //   clearInterval(pollingIntervalRef.current)
      //   pollingIntervalRef.current = null
      // }
      // Reset when id changes so we can fetch the new customer
      if (currentIdRef.current === id) {
        currentIdRef.current = null
      }
      isFetchingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) // Only depend on id - Zustand functions are stable and don't need to be in deps

  const handleManualRefresh = async () => {
    if (!id) return
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchCustomer(id),
        fetchActionPlanByCustomerId(id),
        fetchConversationsForCustomer(id)
      ])
    } finally {
      setIsRefreshing(false)
    }
  }
  
  const lastConversation = conversations.length > 0 ? conversations[0] : null

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
        <View direction="row" gap={3} justify="space-between" align="center">
          <Link to="/triage">
            <Button variant="outline" icon={<ArrowLeft />}>
              Back to Triage
            </Button>
          </Link>
          <Button
            variant="outline"
            icon={<Icon svg={<ArrowsClockwise weight="bold" />} size={4} />}
            onClick={handleManualRefresh}
            disabled={isRefreshing || customerLoading || actionPlanLoading || conversationsLoading}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </View>

        <CustomerMetadataCard
          id={customer.id}
          name={customer.name}
          companyName={customer.companyName}
          email={customer.email}
          phone={customer.phone}
          badge={(actionPlan?.badge as any) || 'no-action'}
          avatar={customer.avatar}
        />

        <ActionPlanCard
          actionPlanId={actionPlan?.id}
          customerId={customer.id}
          hasActionPlan={!!actionPlan}
          status={actionPlan?.status as any}
        />

        <Card padding={6}>
          <View direction="column" gap={3}>
            <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
              <View direction="row" gap={2} align="center">
                <ChatCircle size={20} weight="bold" />
                <Text variant="title-5" weight="bold">
                  Conversation History
                </Text>
              </View>
              {lastConversation && (
                <Link to={`/customers/${customer.id}/conversations`}>
                  <Button size="small" variant="outline" icon={<ArrowRight />}>
                    View All
                  </Button>
                </Link>
              )}
            </View>
            {lastConversation ? (
              <View direction="column" gap={2}>
                <Text variant="body-2" color="neutral-faded">
                  Most recent: {formatRelativeTime(lastConversation.date)}
                </Text>
                {lastConversation.summary && (
                  <Text variant="body-3" color="neutral-faded">
                    {lastConversation.summary.substring(0, 150)}...
                  </Text>
                )}
                <Link to={`/customers/${customer.id}/conversations`}>
                  <Text variant="body-2" attributes={{ style: { color: 'var(--rs-color-primary)', cursor: 'pointer' } }}>
                    View conversation history →
                  </Text>
                </Link>
              </View>
            ) : (
              <Text variant="body-2" color="neutral-faded">
                No conversations yet
              </Text>
            )}
          </View>
        </Card>
      </View>
    </Container>
  )
}
