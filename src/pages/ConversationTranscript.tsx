import { Container, View, Button, Text } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { ConversationTranscript as ConversationTranscriptComponent } from '../components/custom/ConversationTranscript'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { useAppStore } from '../store/useAppStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useEffect } from 'react'
import { TriageBreadcrumbs } from '../components/custom/Breadcrumbs'
import { CustomerPageHeader } from '../components/custom/CustomerPageHeader'

export default function ConversationTranscript() {
  const { customerId, conversationId } = useParams<{ customerId: string; conversationId: string }>()
  const setActiveConversation = useAppStore((state) => state.setActiveConversation)
  const setActiveCustomer = useAppStore((state) => state.setActiveCustomer)
  
  // Get customer from store
  const customer = useCustomersStore((state) => state.currentCustomer)
  const customerLoading = useCustomersStore((state) => state.currentCustomerLoading)
  const fetchCustomer = useCustomersStore((state) => state.fetchCustomer)
  
  // Get conversation from store
  const conversation = useConversationsStore((state) => state.currentConversation)
  const conversationLoading = useConversationsStore((state) => state.currentConversationLoading)
  const fetchConversation = useConversationsStore((state) => state.fetchConversation)
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const fetchActionPlanByCustomerId = useActionPlansStore((state) => state.fetchActionPlanByCustomerId)
  
  // Fetch conversation on mount
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId)
      fetchConversation(conversationId)
    }
  }, [conversationId, setActiveConversation, fetchConversation])
  
  // Fetch customer and action plan when conversation loads
  useEffect(() => {
    if (customerId || conversation?.customerId) {
      const id = customerId || conversation?.customerId
      if (id) {
        setActiveCustomer(id)
        fetchCustomer(id)
        fetchActionPlanByCustomerId(id)
      }
    }
  }, [customerId, conversation?.customerId, setActiveCustomer, fetchCustomer, fetchActionPlanByCustomerId])

  if (!conversation && !conversationLoading) {
    return (
      <Container>
        <View direction="column" gap={4}>
          <Text variant="body-2" color="neutral-faded">
            Conversation not found
          </Text>
        </View>
      </Container>
    )
  }

  const effectiveCustomerId = customerId || conversation?.customerId
  const conversationDate = conversation?.date ? new Date(conversation.date).toLocaleDateString() : undefined

  return (
    <Container>
      <View direction="column" gap={6}>
        <TriageBreadcrumbs 
          customerName={customer?.name || conversation?.customer?.name} 
          customerId={effectiveCustomerId}
          showConversationHistory={true}
          conversationDate={conversationDate}
          conversationId={conversationId}
        />
        
        {(customer || conversation?.customer) && (
          <CustomerPageHeader
            customerId={customer?.id || conversation?.customer?.id || ''}
            name={customer?.name || conversation?.customer?.name || ''}
            companyName={customer?.companyName || conversation?.customer?.companyName || ''}
            badge={(actionPlan?.badge as any) || 'no-action'}
            avatar={customer?.avatar || conversation?.customer?.avatar || ''}
          />
        )}

        <Link to={effectiveCustomerId ? `/triage/customers/${effectiveCustomerId}/conversations` : '/triage'}>
          <Button variant="outline" icon={<ArrowLeft />}>
            Back to Conversation History
          </Button>
        </Link>

        {actionPlan && conversation && (
          <ActionPlanCard
            actionPlanId={actionPlan.id}
            customerId={effectiveCustomerId}
            hasActionPlan={true}
            status={actionPlan.status as any}
            aiRecommendation={customer?.actionPlan?.aiRecommendation || actionPlan.recommendation}
            actionItems={actionPlan.actionItems}
            createdAt={actionPlan.createdAt}
          />
        )}

        {conversation && (
          <ConversationTranscriptComponent conversation={{
            id: conversation.id,
            customerId: conversation.customerId,
            channel: conversation.channel as 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message',
            date: conversation.date,
            transcript: conversation.transcript,
            summary: conversation.summary,
            sentiment: conversation.sentiment as 'positive' | 'neutral' | 'negative' | 'mixed' | undefined,
            intent: conversation.intent,
            duration: conversation.duration,
            agent: conversation.agent,
            subject: conversation.subject,
            insights: conversation.insights,
            coachingSuggestions: conversation.coachingSuggestions,
            keyStats: conversation.keyStats,
          }} />
        )}
      </View>
    </Container>
  )
}
