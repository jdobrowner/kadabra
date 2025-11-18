import { Container, View } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Phone, VideoCamera, Envelope, ChatCircle, Robot, Microphone, Clock } from '@phosphor-icons/react'
import { CustomerMetadataCard } from '../components/custom/CustomerMetadataCard'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { Card, Text, Icon } from 'reshaped'
import { CustomButton } from '../components/custom/CustomButton'
import { formatRelativeTime } from '../utils/formatTime'
import { useAppStore } from '../store/useAppStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useEffect, useRef } from 'react'
import { CommunicationChannels, type Communication } from '../components/custom/CommunicationChannels'
import { CustomerPageHeader } from '../components/custom/CustomerPageHeader'

// Stable empty array reference to prevent infinite loops in Zustand selectors
const EMPTY_ARRAY: never[] = []

export default function CustomerOverview() {
  const { customerId } = useParams<{ customerId: string }>()
  const setActiveCustomer = useAppStore((state) => state.setActiveCustomer)
  
  // Get customers list and current customer from store
  // Prefer customer from list if available (same data source as customer cards)
  const customers = useCustomersStore((state) => state.customers)
  const currentCustomer = useCustomersStore((state) => state.currentCustomer)
  const customerLoading = useCustomersStore((state) => state.currentCustomerLoading)
  const fetchCustomer = useCustomersStore((state) => state.fetchCustomer)
  
  // Use customer from list if available, otherwise use currentCustomer
  const customer = customerId 
    ? (customers.find(c => c.id === customerId) || currentCustomer)
    : currentCustomer
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const fetchActionPlanByCustomerId = useActionPlansStore((state) => state.fetchActionPlanByCustomerId)
  
  // Get conversations from store - use stable empty array reference to prevent infinite loops
  const conversations = useConversationsStore((state) => 
    customerId ? (state.conversationsByCustomer[customerId] ?? EMPTY_ARRAY) : EMPTY_ARRAY
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

  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const mostRecentConversation = sortedConversations.length > 0 ? sortedConversations[0] : null

  // Use customer.communications directly (same as CustomerCard) - now fetched by getById endpoint
  // Fallback to calculating from conversations if communications not available
  const communications: Communication[] = customer?.communications && customer.communications.length > 0
    ? customer.communications.map(comm => ({
        type: comm.type as Communication['type'],
        count: comm.count,
        lastTime: comm.lastTime
      }))
    : (() => {
        // Fallback: calculate from conversations if communications not available
        const commMap = new Map<string, { count: number; lastTime: string }>()
        
        conversations.forEach((conv) => {
          const channel = conv.channel as Communication['type']
          // Handle all communication types including ai-call
          if (channel === 'phone' || channel === 'email' || channel === 'sms' || channel === 'voice-message' || channel === 'ai-call' || channel === 'video') {
            const existing = commMap.get(channel)
            if (existing) {
              const existingDate = new Date(existing.lastTime).getTime()
              const currentDate = new Date(conv.date).getTime()
              commMap.set(channel, {
                count: existing.count + 1,
                lastTime: currentDate > existingDate ? conv.date : existing.lastTime
              })
            } else {
              commMap.set(channel, {
                count: 1,
                lastTime: conv.date
              })
            }
          }
        })
        
        return Array.from(commMap.entries()).map(([type, data]) => ({
          type: type as Communication['type'],
          count: data.count,
          lastTime: data.lastTime
        }))
      })()

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

        <ActionPlanCard
          actionPlanId={actionPlan?.id}
          customerId={customer.id}
          hasActionPlan={!!actionPlan}
          status={actionPlan?.status as any}
          aiRecommendation={customer.actionPlan?.aiRecommendation || actionPlan?.recommendation}
          actionItems={actionPlan?.actionItems}
          createdAt={actionPlan?.createdAt}
        />

        <CustomerMetadataCard
          id={customer.id}
          name={customer.name}
          companyName={customer.companyName}
          email={customer.email}
          phone={customer.phone}
          badge={(actionPlan?.badge as any) || 'no-action'}
          avatar={customer.avatar}
        />

        <Card padding={6}>
          <View direction="column" gap={4}>
            {/* Header with Stats */}
            <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
              <View direction="column" gap={2}>
                <h3 style={{ margin: 0 }}>Conversation History</h3>
                {/* Communication Stats */}
                {customer.communications && customer.communications.length > 0 ? (
                  <CommunicationChannels 
                    communications={customer.communications.map(comm => ({
                      type: comm.type as Communication['type'],
                      count: comm.count,
                      lastTime: comm.lastTime
                    }))}
                    textColor="neutral-faded"
                    showTime={false}
                  />
                ) : conversations.length > 0 ? (
                  // Fallback: use computed communications if customer.communications not available
                  <CommunicationChannels communications={communications} textColor="neutral-faded" showTime={false} />
                ) : (
                  <Text variant="body-2" color="neutral-faded">
                    No conversations yet
                  </Text>
                )}
              </View>
              {conversations.length > 0 && (
                <Link to={`/triage/customers/${customer.id}/conversations`}>
                  <CustomButton variant="ghost">
                    <View direction="row" gap={2} align="center">
                      <Text>View All</Text>
                      <Icon svg={<ArrowRight weight="bold" />} size={4} />
                    </View>
                  </CustomButton>
                </Link>
              )}
            </View>

            {/* Most Recent Conversation */}
            {mostRecentConversation && customer.lastCommunication && (
              <View direction="column" gap={3} attributes={{ style: { paddingTop: '16px', borderTop: '1px solid var(--rs-color-border-neutral-faded)' } }}>
                <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                  <View direction="column" gap={2} attributes={{ style: { flex: 1 } }}>
                    <Text variant="body-1" color="neutral-faded" weight="medium">
                      Most Recent
                    </Text>
                    <Text variant="body-2" color="neutral">
                      {customer.lastCommunication.topic || customer.lastCommunication.longTopic}
                    </Text>
                    <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
                      <View direction="row" gap={1} align="center">
                        <Icon 
                          svg={<Clock weight="bold" />} 
                          attributes={{ 
                            style: { color: 'var(--rs-color-foreground-neutral-faded)' } 
                          }} 
                        />
                        <Text variant="body-2" color="neutral-faded">
                          {formatRelativeTime(customer.lastCommunication.time)}
                        </Text>
                      </View>
                      <Text variant="body-2" color="neutral-faded">•</Text>
                      <View direction="row" gap={1} align="center">
                        {(() => {
                          const channelType = mostRecentConversation.channel as Communication['type']
                          const ChannelIcon = channelType === 'phone' ? Phone :
                                            channelType === 'video' ? VideoCamera :
                                            channelType === 'email' ? Envelope :
                                            channelType === 'sms' ? ChatCircle :
                                            channelType === 'ai-call' ? Robot :
                                            channelType === 'voice-message' ? Microphone :
                                            Phone
                          const channelLabel = channelType === 'phone' ? 'Call' :
                                             channelType === 'video' ? 'Video' :
                                             channelType === 'email' ? 'Email' :
                                             channelType === 'sms' ? 'SMS' :
                                             channelType === 'ai-call' ? 'AI Call' :
                                             channelType === 'voice-message' ? 'Voice Message' :
                                             'Call'
                          return (
                            <>
                              <Icon 
                                svg={<ChannelIcon weight="bold" />}
                                attributes={{ 
                                  style: { color: 'var(--rs-color-foreground-neutral-faded)' } 
                                }} 
                              />
                              <Text variant="body-2" color="neutral-faded">
                                {channelLabel}
                              </Text>
                            </>
                          )
                        })()}
                      </View>
                    </View>
                  </View>
                  <Link to={`/triage/customers/${customer.id}/conversations/${mostRecentConversation.id}`}>
                    <CustomButton variant="ghost">
                      <View direction="row" gap={2} align="center">
                        <Text>Transcript</Text>
                        <Icon svg={<ArrowRight weight="bold" />} size={4} />
                      </View>
                    </CustomButton>
                  </Link>
                </View>
              </View>
            )}
          </View>
        </Card>
      </View>
    </Container>
  )
}
