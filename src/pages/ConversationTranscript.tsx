import { Container, View, Button, Text } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { ConversationTranscript as ConversationTranscriptComponent } from '../components/custom/ConversationTranscript'
import { ActionPlanCard } from '../components/custom/ActionPlanCard'
import { useAppStore } from '../store/useAppStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useEffect } from 'react'

export default function ConversationTranscript() {
  const { id } = useParams<{ id: string }>()
  const setActiveConversation = useAppStore((state) => state.setActiveConversation)
  const setActiveCustomer = useAppStore((state) => state.setActiveCustomer)
  
  // Get conversation from store
  const conversation = useConversationsStore((state) => state.currentConversation)
  const conversationLoading = useConversationsStore((state) => state.currentConversationLoading)
  const fetchConversation = useConversationsStore((state) => state.fetchConversation)
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const fetchActionPlanByCustomerId = useActionPlansStore((state) => state.fetchActionPlanByCustomerId)
  
  // Fetch conversation on mount
  useEffect(() => {
    if (id) {
      setActiveConversation(id)
      fetchConversation(id)
    }
  }, [id, setActiveConversation, fetchConversation])
  
  // Fetch action plan when conversation loads
  useEffect(() => {
    if (conversation?.customerId) {
      setActiveCustomer(conversation.customerId)
      fetchActionPlanByCustomerId(conversation.customerId)
    }
  }, [conversation?.customerId, setActiveCustomer, fetchActionPlanByCustomerId])

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

  return (
    <Container>
      <View direction="column" gap={6}>
        <Link to={conversation?.customerId ? `/customers/${conversation.customerId}/conversations` : '/triage'}>
          <Button variant="outline" icon={<ArrowLeft />}>
            Back
          </Button>
        </Link>

        {actionPlan && conversation && (
          <ActionPlanCard
            actionPlanId={actionPlan.id}
            customerId={conversation.customerId}
            hasActionPlan={true}
            status={actionPlan.status as any}
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
