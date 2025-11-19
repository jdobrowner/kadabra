import { Container, View, Card, Text, Loader } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Phone, User, Copy, CheckCircle, Plus, Bell, FileText, Lightning } from '@phosphor-icons/react'
import { StyledDropdown } from '../components/custom/StyledDropdown'
import { ReminderForm } from '../components/custom/ReminderForm'
import { CustomButton } from '../components/custom/CustomButton'
import { useAppStore } from '../store/useAppStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useBoardsStore, type BoardColumn } from '../store/useBoardsStore'
import { useTeamsStore } from '../store/useTeamsStore'
import { trpcVanillaClient } from '../lib/trpc-client'
import { useConversationsStore } from '../store/useConversationsStore'
import { useEffect, useState } from 'react'
import { CustomBadge } from '../components/custom/Badge'
import { CustomerPageHeader } from '../components/custom/CustomerPageHeader'
import { useCustomersStore } from '../store/useCustomersStore'

// Stable empty array reference
const EMPTY_ARRAY: never[] = []

export default function ActionPlan() {
  const { customerId, actionPlanId } = useParams<{ customerId: string; actionPlanId: string }>()
  const setActiveActionPlan = useAppStore((state) => state.setActiveActionPlan)
  const setActiveCustomer = useAppStore((state) => state.setActiveCustomer)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
  const [promotionBoardId, setPromotionBoardId] = useState<string>('')
  const [promotionColumnId, setPromotionColumnId] = useState<string>('')
  const [promotionTeamId, setPromotionTeamId] = useState<string>('')
  const [promotionColumns, setPromotionColumns] = useState<BoardColumn[]>([])
  const [columnsLoading, setColumnsLoading] = useState(false)
  const [promotionStatus, setPromotionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [promotionError, setPromotionError] = useState<string | null>(null)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [selectedActionItemId, setSelectedActionItemId] = useState<string | null>(null)
  
  // Get action plan from store
  const actionPlan = useActionPlansStore((state) => state.currentActionPlan)
  const planLoading = useActionPlansStore((state) => state.currentActionPlanLoading)
  const fetchActionPlan = useActionPlansStore((state) => state.fetchActionPlan)
  const markActionPlanComplete = useActionPlansStore((state) => state.markActionPlanComplete)
  const markActionPlanIncomplete = useActionPlansStore((state) => state.markActionPlanIncomplete)
  const promoteActionPlanToBoard = useActionPlansStore((state) => state.promoteActionPlanToBoard)

  const boards = useBoardsStore((state) => state.boards)
  const boardsLoading = useBoardsStore((state) => state.boardsLoading)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)

  const teams = useTeamsStore((state) => state.teams)
  const fetchTeams = useTeamsStore((state) => state.fetchTeams)
  
  // Get customer from store
  const customer = useCustomersStore((state) => state.currentCustomer)
  const fetchCustomer = useCustomersStore((state) => state.fetchCustomer)
  
  // Get conversations from store
  const conversations = useConversationsStore((state) => 
    actionPlan?.customerId ? (state.conversationsByCustomer[actionPlan.customerId] ?? EMPTY_ARRAY) : EMPTY_ARRAY
  )
  const fetchConversationsForCustomer = useConversationsStore((state) => state.fetchConversationsForCustomer)
  
  // Fetch action plan on mount
  useEffect(() => {
    if (actionPlanId) {
      setActiveActionPlan(actionPlanId)
      fetchActionPlan(actionPlanId)
    }
  }, [actionPlanId, setActiveActionPlan, fetchActionPlan])
  
  // Fetch customer and conversations when customerId or action plan loads
  useEffect(() => {
    const effectiveCustomerId = customerId || actionPlan?.customerId
    if (effectiveCustomerId) {
      setActiveCustomer(effectiveCustomerId)
      fetchCustomer(effectiveCustomerId)
      fetchConversationsForCustomer(effectiveCustomerId)
    }
  }, [customerId, actionPlan?.customerId, setActiveCustomer, fetchCustomer, fetchConversationsForCustomer])

  useEffect(() => {
    fetchBoards()
    fetchTeams()
  }, [fetchBoards, fetchTeams])

  useEffect(() => {
    if (!actionPlan) {
      setPromotionBoardId('')
      setPromotionColumnId('')
      setPromotionTeamId('')
      return
    }

    if (actionPlan.boardCard) {
      setPromotionBoardId(actionPlan.boardCard.boardId)
      setPromotionColumnId(actionPlan.boardCard.columnId)
    }

    if (actionPlan.assigneeTeamId) {
      setPromotionTeamId(actionPlan.assigneeTeamId)
    } else {
      setPromotionTeamId('')
    }
  }, [actionPlan])

  useEffect(() => {
    if (!promotionBoardId && boards.length > 0) {
      setPromotionBoardId(boards[0].id)
    }
  }, [boards, promotionBoardId])

  useEffect(() => {
    if (!promotionBoardId) {
      setPromotionColumns([])
      setPromotionColumnId('')
      return
    }

    let active = true
    setColumnsLoading(true)
    ;(async () => {
      try {
        const detail = await trpcVanillaClient.boards.detail.query({ id: promotionBoardId })
        if (!active) return
        setPromotionColumns(detail.columns)
        if (!detail.columns.some((column) => column.id === promotionColumnId)) {
          setPromotionColumnId(detail.columns[0]?.id ?? '')
        }
      } catch {
        if (active) {
          setPromotionColumns([])
        }
      } finally {
        if (active) {
          setColumnsLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [promotionBoardId, promotionColumnId])

  useEffect(() => {
    if (promotionStatus !== 'idle') {
      setPromotionStatus('idle')
      setPromotionError(null)
    }
  }, [promotionBoardId, promotionColumnId, promotionTeamId])
  
  const handleMarkComplete = async () => {
    if (!actionPlanId) return
    setIsUpdatingStatus(true)
    try {
      await markActionPlanComplete(actionPlanId)
    } catch (error) {
      console.error('Failed to mark action plan complete:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleMarkIncomplete = async () => {
    if (!actionPlanId) return
    setIsUpdatingStatus(true)
    try {
      await markActionPlanIncomplete(actionPlanId)
    } catch (error) {
      console.error('Failed to mark action plan incomplete:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCopyOutline = () => {
    if (!actionPlan?.actionItems) return
    const outline = actionPlan.actionItems
      .map((item, index) => `${index + 1}. ${item.title}\n   ${item.description}`)
      .join('\n\n')
    navigator.clipboard.writeText(outline)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePromoteToBoard = async () => {
    if (!actionPlan || !actionPlan.id) {
      return
    }

    if (!promotionBoardId || !promotionColumnId) {
      setPromotionStatus('error')
      setPromotionError('Select a board and column before promoting.')
      return
    }

    setIsPromoting(true)
    setPromotionStatus('idle')
    setPromotionError(null)

    try {
      await promoteActionPlanToBoard({
        actionPlanId: actionPlan.id,
        boardId: promotionBoardId,
        columnId: promotionColumnId,
        assigneeTeamId: promotionTeamId || undefined,
        metadata: { source: 'action-plan-view' },
      })
      await fetchActionPlan(actionPlan.id)
      setPromotionStatus('success')
    } catch (error: any) {
      setPromotionStatus('error')
      setPromotionError(error?.message || 'Failed to sync with board.')
    } finally {
      setIsPromoting(false)
    }
  }
  
  const lastConversation = conversations.length > 0 ? conversations[0] : null
  const selectedBoardMeta = boards.find((board) => board.id === promotionBoardId)
  const promotionButtonLabel = actionPlan?.boardCard ? 'Update board card' : 'Promote to board'

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'at-risk':
        return 'critical'
      case 'opportunity':
        return 'warning'
      case 'lead':
        return 'positive'
      case 'follow-up':
        return 'primary'
      default:
        return 'neutral'
    }
  }

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case 'at-risk':
        return 'At-Risk'
      case 'opportunity':
        return 'Opportunity'
      case 'lead':
        return 'Potential Lead'
      case 'follow-up':
        return 'Follow-Up'
      default:
        return ''
    }
  }

  if (!actionPlan) {
    return (
      <Container>
        <View direction="column" gap={4}>
          {planLoading ? (
            <View align="center" justify="center" attributes={{ style: { padding: '40px' } }}>
              <Loader />
            </View>
          ) : (
            <Text variant="body-2" color="neutral-faded">
              Action plan not found
            </Text>
          )}
        </View>
      </Container>
    )
  }

  return (
    <Container>
      <View direction="column" gap={6}>
        {customer && (
          <CustomerPageHeader
            customerId={customer.id}
            name={customer.name}
            companyName={customer.companyName}
            badge={(actionPlan?.badge as any) || 'no-action'}
            avatar={customer.avatar}
            pageName="Action Plan"
            rightContent={
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" color="neutral-faded">Assigned to:</Text>
                <CustomButton size="small" variant="outline" icon={<User />}>
                  + Assign
                </CustomButton>
              </View>
            }
          />
        )}
      </View>
      
      <View direction="column" gap={6} attributes={{ style: { marginTop: '24px' } }}>
        {/* 2-column grid for cards */}
        <View 
          direction="row" 
          gap={6} 
          align="stretch"
          attributes={{ 
            style: { 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              alignItems: 'start'
            } 
          }}
        >
          {/* AI Strategy Recommendation Card */}
          <Card padding={6}>
            <View direction="column" gap={5}>
              <View direction="row" gap={3} align="center">
                <Lightbulb size={20} weight="bold" />
                <Text variant="title-5" weight="bold">
                  AI Strategy Recommendation
                </Text>
              </View>
              
              <View direction="column" gap={4}>
                <View direction="column" gap={2}>
                  <Text variant="body-1" weight="semibold" color="neutral">
                    {actionPlan.recommendation || actionPlan.whatToDo.substring(0, 100)}
                  </Text>
                  <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: '1.6' } }}>
                    {actionPlan.whatToDo}
                  </Text>
                </View>
                
                <View direction="column" gap={2} attributes={{ style: { paddingTop: '8px', borderTop: '1px solid var(--rs-color-border-neutral-faded)' } }}>
                  <Text variant="body-2" weight="semibold" color="neutral">Why this strategy:</Text>
                  <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: '1.6' } }}>
                    {actionPlan.whyStrategy}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Most Recent Call Card */}
          <Card padding={6}>
            <View direction="column" gap={5}>
              <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }} wrap>
                <View direction="row" gap={3} align="center">
                  <Phone size={20} weight="bold" />
                  <Text variant="title-5" weight="bold">
                    Most Recent Call
                  </Text>
                </View>
                {lastConversation && (
                  <Text variant="body-3" color="neutral-faded">
                    {new Date(lastConversation.date).toLocaleDateString()}, {new Date(lastConversation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
              
              {lastConversation ? (
                <View direction="column" gap={4}>
                  <View direction="row" gap={6} wrap>
                    <View direction="column" gap={2}>
                      <Text variant="body-3" color="neutral-faded">Duration</Text>
                      <Text variant="body-2" weight="medium">{lastConversation.duration ? `${Math.floor(lastConversation.duration / 60)}m ${lastConversation.duration % 60}s` : 'N/A'}</Text>
                    </View>
                    <View direction="column" gap={2}>
                      <Text variant="body-3" color="neutral-faded">Caller</Text>
                      <Text variant="body-2" weight="medium">{customer?.name || 'Unknown'}</Text>
                    </View>
                    <View direction="column" gap={2}>
                      <Text variant="body-3" color="neutral-faded">Sentiment</Text>
                      <CustomBadge color={lastConversation.sentiment === 'negative' ? 'critical' : lastConversation.sentiment === 'positive' ? 'positive' : 'neutral'}>
                        {lastConversation.sentiment || 'Neutral'}
                      </CustomBadge>
                    </View>
                  </View>
                  
                  <View direction="column" gap={2} attributes={{ style: { paddingTop: '8px', borderTop: '1px solid var(--rs-color-border-neutral-faded)' } }}>
                    <Text variant="body-2" weight="semibold" color="neutral">Call Summary:</Text>
                    <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: '1.6' } }}>
                      {lastConversation.summary || 'No summary available'}
                    </Text>
                  </View>
                  
                  <View direction="row" gap={2}>
                    <Link to={`/triage/customers/${actionPlan.customerId}/conversations/${lastConversation.id}`}>
                      <CustomButton size="small">View Details</CustomButton>
                    </Link>
                    <Link to={`/triage/customers/${actionPlan.customerId}/conversations`}>
                      <CustomButton size="small" variant="outline">Call History</CustomButton>
                    </Link>
                  </View>
                </View>
              ) : (
                <Text variant="body-2" color="neutral-faded">
                  No conversations yet
                </Text>
              )}
            </View>
          </Card>

          {/* Call Back Card */}
          <Card padding={6}>
            <View direction="column" gap={5}>
              <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between', width: '100%' } }}>
                <View direction="row" gap={3} align="center">
                  <Phone size={20} weight="bold" />
                  <Text variant="title-5" weight="bold">
                    Call Back
                  </Text>
                </View>
                <CustomBadge color="purple" icon={Lightning}>
                  Action Item
                </CustomBadge>
              </View>
              
              <View direction="column" gap={4}>
                <Text variant="body-2" weight="semibold" color="neutral">Conversation Outline:</Text>
                <View direction="column" gap={4}>
                  {actionPlan.actionItems && actionPlan.actionItems.length > 0 ? (
                    actionPlan.actionItems.map((item, index) => (
                      <View key={item.id} direction="row" gap={3} align="start" attributes={{ style: { paddingTop: index > 0 ? '12px' : '0', borderTop: index > 0 ? '1px solid var(--rs-color-border-neutral-faded)' : 'none' } }}>
                        <Text variant="body-2" weight="bold" color="primary" attributes={{ style: { flexShrink: 0, marginTop: '2px' } }}>
                          {index + 1}.
                        </Text>
                        <View direction="column" gap={2} attributes={{ style: { flex: 1 } }}>
                          <Text variant="body-2" weight="medium">{item.title}</Text>
                          <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: '1.6' } }}>{item.description}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text variant="body-2" color="neutral-faded">No action items defined</Text>
                  )}
                </View>
              </View>
            </View>
          </Card>

          {/* Create Case Card */}
          <Card padding={6}>
            <View direction="column" gap={5}>
              <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between', width: '100%' } }}>
                <View direction="row" gap={3} align="center">
                  <FileText size={20} weight="bold" />
                  <Text variant="title-5" weight="bold">
                    Create Case
                  </Text>
                </View>
                <CustomBadge color="purple" icon={Lightning}>
                  Action Item
                </CustomBadge>
              </View>
              
              <View direction="column" gap={4}>
                <View direction="row" gap={6} wrap>
                  <View direction="column" gap={2} attributes={{ style: { flex: '1 1 200px' } }}>
                    <Text variant="body-3" color="neutral-faded">Contact</Text>
                    <Text variant="body-2" weight="medium">{customer?.name || 'N/A'}</Text>
                  </View>
                  <View direction="column" gap={2} attributes={{ style: { flex: '1 1 200px' } }}>
                    <Text variant="body-3" color="neutral-faded">Account</Text>
                    <Text variant="body-2" weight="medium">{customer?.companyName || 'N/A'}</Text>
                  </View>
                </View>
                <View direction="column" gap={2}>
                  <Text variant="body-3" color="neutral-faded">Subject</Text>
                  <Text variant="body-2" weight="medium">Follow-up on service concerns</Text>
                </View>
                <View direction="column" gap={2}>
                  <Text variant="body-3" color="neutral-faded">Description</Text>
                  <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: '1.6' } }}>
                    {lastConversation?.summary || actionPlan.whyStrategy || 'Customer requires follow-up based on recent interactions.'}
                  </Text>
                </View>
                <View direction="row" gap={6} wrap>
                  <View direction="column" gap={2}>
                    <Text variant="body-3" color="neutral-faded">Priority</Text>
                    <CustomBadge color={actionPlan.badge === 'at-risk' ? 'critical' : 'warning'}>
                      High
                    </CustomBadge>
                  </View>
                  <View direction="column" gap={2}>
                    <Text variant="body-3" color="neutral-faded">Origin</Text>
                    <Text variant="body-2" weight="medium">Phone (Mindi)</Text>
                  </View>
                </View>
              </View>
              
              <CustomButton color="primary" icon={<CheckCircle />} attributes={{ style: { marginTop: '8px' } }}>
                Create Case
              </CustomButton>
            </View>
          </Card>
        </View>

        {/* Action Status Bar - Full Width */}
        <Card padding={6}>
          <View direction="row" gap={4} align="center" attributes={{ style: { justifyContent: 'space-between' } }} wrap>
            <View direction="column" gap={2} attributes={{ style: { flex: 1, minWidth: 0 } }}>
              <Text variant="title-5" weight="bold">Action Status</Text>
              <Text variant="body-2" color="neutral-faded">
                Complete this action to move to the next customer interaction
              </Text>
            </View>
            <View direction="row" gap={3} align="center" attributes={{ style: { flexShrink: 0 } }}>
              {actionPlan.status === 'completed' && !isUpdatingStatus && (
                <CustomBadge color="positive">Completed</CustomBadge>
              )}
              {(actionPlan.status === 'active' || actionPlan.status === 'completed') && (
                <CustomButton 
                  onClick={actionPlan.status === 'completed' ? handleMarkIncomplete : handleMarkComplete}
                  disabled={isUpdatingStatus}
                  icon={<CheckCircle />}
                  variant={actionPlan.status === 'completed' ? 'outline' : undefined}
                  color={actionPlan.status === 'active' ? 'positive' : undefined}
                >
                  {isUpdatingStatus
                    ? 'Updating...'
                    : actionPlan.status === 'completed'
                      ? 'Mark Action as Incomplete'
                      : 'Mark Action as Complete'}
                </CustomButton>
              )}
            </View>
          </View>
        </Card>
      </View>

      {/* Reminder Form Modal */}
      {showReminderForm && selectedActionItemId && (
        <ReminderForm
          actionItemId={selectedActionItemId}
          customerId={actionPlan.customerId}
          onClose={() => {
            setShowReminderForm(false)
            setSelectedActionItemId(null)
          }}
          onSuccess={() => {
            setShowReminderForm(false)
            setSelectedActionItemId(null)
          }}
        />
      )}
    </Container>
  )
}
