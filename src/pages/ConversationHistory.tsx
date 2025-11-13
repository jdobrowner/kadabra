import { Container, View, Button, Text } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { PageHeader } from '../components/custom/PageHeader'
import { ConversationTimeline } from '../components/custom/ConversationTimeline'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { useCustomersStore } from '../store/useCustomersStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useEffect } from 'react'

export default function ConversationHistory() {
  const { id } = useParams<{ id: string }>()
  
  // Get customer from store
  const customer = useCustomersStore((state) => state.currentCustomer)
  const customerLoading = useCustomersStore((state) => state.currentCustomerLoading)
  const fetchCustomer = useCustomersStore((state) => state.fetchCustomer)
  
  // Get conversations from store
  const conversations = useConversationsStore((state) => 
    id ? state.conversationsByCustomer[id] || [] : []
  )
  const fetchConversationsForCustomer = useConversationsStore((state) => state.fetchConversationsForCustomer)
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const fetchActionPlanByCustomerId = useActionPlansStore((state) => state.fetchActionPlanByCustomerId)
  
  const customerName = customer?.name
  
  // Fetch data on mount
  useEffect(() => {
    if (id) {
      fetchCustomer(id)
      fetchConversationsForCustomer(id)
      fetchActionPlanByCustomerId(id)
    }
  }, [id, fetchCustomer, fetchConversationsForCustomer, fetchActionPlanByCustomerId])

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

  const timelineItems = conversations.map(conv => ({
    id: conv.id,
    channel: conv.channel as 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message',
    date: conv.date,
    sentiment: conv.sentiment as 'positive' | 'neutral' | 'negative' | 'mixed' | undefined,
    summary: conv.summary,
    subject: conv.subject,
    agent: conv.agent,
    duration: conv.duration,
    messageCount: conv.messageCount
  })) || []

  return (
    <Container>
      <View direction="column" gap={6}>
        <Link to={`/customers/${id}`}>
          <Button variant="outline" icon={<ArrowLeft />}>
            Back to Customer
          </Button>
        </Link>

        <PageHeader
          title="Conversation History"
          subtitle={`Complete communication history with ${customerName ?? 'this customer'}`}
        />

        {actionPlan && customer && (
          <ActionPlanCard
            actionPlanId={actionPlan.id}
            customerId={customer.id}
            hasActionPlan={true}
            status={actionPlan.status as any}
          />
        )}

        {timelineItems.length > 0 ? (
          <ConversationTimeline conversations={timelineItems} />
        ) : (
          <View attributes={{ style: { textAlign: 'center', padding: '40px' } }}>
            <Text variant="body-2" color="neutral-faded">
              No conversations found for this customer.
            </Text>
          </View>
        )}
      </View>
    </Container>
  )
}
