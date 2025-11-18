import { Container, View, Button, Card, Text, Loader } from 'reshaped'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Phone, User, Copy, CheckCircle, Plus, Bell } from '@phosphor-icons/react'
import { StyledDropdown } from '../components/custom/StyledDropdown'
import { ReminderForm } from '../components/custom/ReminderForm'
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
            badge={(actionPlan?.badge as any) || 'no-action'}
            avatar={customer.avatar}
          />
        )}
      </View>
      
      <View
        direction="row"
        gap={6}
        align="stretch"
        attributes={{ style: { flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '24px' } }}
      >
        <View direction="column" gap={6} attributes={{ style: { flex: 1, minWidth: 0 } }}>
          {/* Header */}
          <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
            <View direction="row" gap={3} align="center">
              <Link to={customer && customerId ? `/triage/customers/${customerId}` : '/triage'}>
                <Button variant="outline" icon={<ArrowLeft />}>
                  Back
                </Button>
              </Link>
              <View direction="column" gap={1}>
                <View direction="row" gap={2} align="center">
                  {actionPlan.badge && (
                    <CustomBadge color={getBadgeColor(actionPlan.badge) as any} badgeType={actionPlan.badge as any}>
                      {getBadgeLabel(actionPlan.badge)}
                    </CustomBadge>
                  )}
                </View>
              </View>
            </View>
            <View direction="row" gap={2} align="center">
              <Text variant="body-2" color="neutral-faded">Assigned to:</Text>
              <Button size="small" variant="outline" icon={<User />}>
                + Assign
              </Button>
            </View>
          </View>

        <View direction="column" gap={4}>
          {/* AI Strategy Recommendation Card */}
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="row" gap={2} align="center">
                <Lightbulb size={20} weight="bold" />
                <Text variant="title-5" weight="bold">
                  AI Strategy Recommendation
                </Text>
              </View>
              
              <View direction="column" gap={3}>
                <View direction="column" gap={1}>
                  <Text variant="body-1" weight="medium" color="primary">
                    {actionPlan.recommendation || actionPlan.whatToDo.substring(0, 100)}
                  </Text>
                  <Text variant="body-3" color="neutral-faded">
                    {actionPlan.whatToDo}
                  </Text>
                </View>
                
                <View direction="column" gap={2}>
                  <Text variant="body-2" weight="medium">Why this strategy:</Text>
                  <Text variant="body-3" color="neutral-faded">
                    {actionPlan.whyStrategy}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Board Promotion */}
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="row" justify="space-between" align="center">
                <View direction="column" gap={1}>
                  <Text variant="title-5" weight="bold">
                    Board assignment & routing
                  </Text>
                  <Text variant="caption-1" color="neutral-faded">
                    Sync this action plan with the right team board so work can be tracked.
                  </Text>
                </View>
                {actionPlan.boardCard && (
                  <Text variant="caption-1" color="primary">
                    {actionPlan.boardCard.boardName} → {actionPlan.boardCard.columnName}
                  </Text>
                )}
              </View>

              {actionPlan.boardCard && (
                <View direction="row" gap={2} align="center" wrap>
                  <Link to={`/boards/${actionPlan.boardCard.boardId}`}>
                    <Button size="small" variant="outline">
                      View board
                    </Button>
                  </Link>
                  <Text variant="caption-1" color="neutral-faded">
                    Card status: {actionPlan.boardCard.status === 'done' ? 'Done' : 'Active'}
                  </Text>
                </View>
              )}

              <View direction="column" gap={3}>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" weight="medium">
                    Board
                  </Text>
                  {boardsLoading || boards.length === 0 ? (
                    <Text variant="caption-1" color="neutral-faded">
                      {boardsLoading ? 'Loading boards…' : 'No boards available'}
                    </Text>
                  ) : (
                    <StyledDropdown
                      trigger={
                        <Text>
                          {promotionBoardId ? boards.find(b => b.id === promotionBoardId)?.name || 'Select board' : 'Select board'}
                        </Text>
                      }
                      disabled={isPromoting}
                      fullWidth
                    >
                      {boards.map((boardItem) => (
                        <StyledDropdown.Item
                          key={boardItem.id}
                          onClick={() => setPromotionBoardId(boardItem.id)}
                        >
                          {boardItem.name}
                        </StyledDropdown.Item>
                      ))}
                    </StyledDropdown>
                  )}
                  {selectedBoardMeta && (
                    <Text variant="caption-1" color="neutral-faded">
                      {selectedBoardMeta.cardType.toUpperCase()} •{' '}
                      {selectedBoardMeta.visibility === 'org' ? 'Org-wide' : 'Team only'}
                    </Text>
                  )}
                </View>

                <View direction="column" gap={1}>
                  <Text variant="caption-1" weight="medium">
                    Column
                  </Text>
                  {columnsLoading ? (
                    <Text variant="caption-1" color="neutral-faded">
                      Loading columns…
                    </Text>
                  ) : promotionColumns.length === 0 ? (
                    <Text variant="caption-1" color="neutral-faded">
                      This board has no columns yet. Configure columns in Settings → Boards.
                    </Text>
                  ) : (
                    <StyledDropdown
                      trigger={
                        <Text>
                          {promotionColumnId ? promotionColumns.find(c => c.id === promotionColumnId)?.name || 'Select column' : 'Select column'}
                        </Text>
                      }
                      disabled={isPromoting}
                      fullWidth
                    >
                      {promotionColumns.map((column) => (
                        <StyledDropdown.Item
                          key={column.id}
                          onClick={() => setPromotionColumnId(column.id)}
                        >
                          {column.name}
                        </StyledDropdown.Item>
                      ))}
                    </StyledDropdown>
                  )}
                </View>

                <View direction="column" gap={1}>
                  <Text variant="caption-1" weight="medium">
                    Assign team (optional)
                  </Text>
                  <StyledDropdown
                    trigger={
                      <Text>
                        {promotionTeamId ? teams.find(t => t.id === promotionTeamId)?.name || 'Unassigned' : 'Unassigned'}
                      </Text>
                    }
                    disabled={isPromoting}
                    fullWidth
                  >
                    <StyledDropdown.Item onClick={() => setPromotionTeamId('')}>
                      Unassigned
                    </StyledDropdown.Item>
                    {teams.map((team) => (
                      <StyledDropdown.Item
                        key={team.id}
                        onClick={() => setPromotionTeamId(team.id)}
                      >
                        {team.name}
                      </StyledDropdown.Item>
                    ))}
                  </StyledDropdown>
                </View>
              </View>

              {promotionStatus === 'success' && (
                <Text variant="caption-1" color="positive">
                  Action plan synced with {selectedBoardMeta?.name ?? 'board'} successfully.
                </Text>
              )}
              {promotionStatus === 'error' && promotionError && (
                <Text variant="caption-1" color="critical">
                  {promotionError}
                </Text>
              )}

              <Button
                size="small"
                icon={<Plus />}
                onClick={handlePromoteToBoard}
                disabled={
                  isPromoting ||
                  !promotionBoardId ||
                  !promotionColumnId ||
                  boardsLoading ||
                  columnsLoading ||
                  promotionColumns.length === 0
                }
              >
                {isPromoting ? 'Syncing…' : promotionButtonLabel}
              </Button>
            </View>
          </Card>

          {/* Most Recent Call Card */}
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                <View direction="row" gap={2} align="center">
                  <Phone size={20} weight="bold" />
                  <Text variant="title-5" weight="bold">
                    Most Recent Call
                  </Text>
                </View>
                {lastConversation && (
                  <Text variant="caption-1" color="neutral-faded">
                    {new Date(lastConversation.date).toLocaleDateString()}, {new Date(lastConversation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
              
              {lastConversation ? (
                <View direction="column" gap={3}>
                  <View direction="row" gap={4}>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1" color="neutral-faded">Duration</Text>
                      <Text variant="body-2">{lastConversation.duration ? `${Math.floor(lastConversation.duration / 60)}m ${lastConversation.duration % 60}s` : 'N/A'}</Text>
                    </View>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1" color="neutral-faded">Caller</Text>
                      <Text variant="body-2">{customer?.name || 'Unknown'}</Text>
                    </View>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1" color="neutral-faded">Sentiment</Text>
                      <CustomBadge color={lastConversation.sentiment === 'negative' ? 'critical' : lastConversation.sentiment === 'positive' ? 'positive' : 'neutral'}>
                        {lastConversation.sentiment || 'Neutral'}
                      </CustomBadge>
                    </View>
                  </View>
                  
                  <View direction="column" gap={2}>
                    <Text variant="body-2" weight="medium">Call Summary:</Text>
                    <Text variant="body-3" color="neutral-faded">
                      {lastConversation.summary || 'No summary available'}
                    </Text>
                  </View>
                  
                  <View direction="row" gap={2}>
                    <Link to={`/triage/customers/${actionPlan.customerId}/conversations/${lastConversation.id}`}>
                      <Button size="small">View Details</Button>
                    </Link>
                    <Link to={`/triage/customers/${actionPlan.customerId}/conversations`}>
                      <Button size="small" variant="outline">Call History</Button>
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
            <View direction="column" gap={4}>
              <View direction="row" gap={2} align="center">
                <Phone size={20} weight="bold" />
                <Text variant="title-5" weight="bold">
                  Call Back
                </Text>
              </View>
              
              <View direction="column" gap={3}>
                <Text variant="body-2" weight="medium">Conversation Outline:</Text>
                <View direction="column" gap={3}>
                  {actionPlan.actionItems && actionPlan.actionItems.length > 0 ? (
                    actionPlan.actionItems.map((item, index) => (
                      <View key={item.id} direction="row" gap={3} align="start">
                        <Text variant="body-2" weight="bold" color="primary">
                          {index + 1}.
                        </Text>
                        <View direction="column" gap={2} attributes={{ style: { flex: 1 } }}>
                          <View direction="column" gap={1}>
                            <Text variant="body-2">{item.title}</Text>
                            <Text variant="body-3" color="neutral-faded">{item.description}</Text>
                          </View>
                          <Button
                            size="small"
                            variant="outline"
                            icon={<Bell weight="bold" />}
                            onClick={() => {
                              setSelectedActionItemId(item.id)
                              setShowReminderForm(true)
                            }}
                          >
                            Create Reminder
                          </Button>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text variant="body-3" color="neutral-faded">No action items defined</Text>
                  )}
                </View>
              </View>
              
              <View direction="row" gap={2}>
                <Button size="small" variant="outline" icon={<Copy />} onClick={handleCopyOutline}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button size="small" icon={<Phone />}>
                  Schedule Call
                </Button>
              </View>
            </View>
          </Card>

          {/* Create Case Card */}
          <Card padding={6}>
            <View direction="column" gap={4}>
              <View direction="row" gap={2} align="center">
                <Plus size={20} weight="bold" />
                <Text variant="title-5" weight="bold">
                  Create Case
                </Text>
              </View>
              
              <View direction="column" gap={3}>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Contact</Text>
                  <Text variant="body-2">{customer?.name || 'N/A'}</Text>
                </View>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Account</Text>
                  <Text variant="body-2">{customer?.companyName || 'N/A'}</Text>
                </View>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Subject</Text>
                  <Text variant="body-2">Follow-up on service concerns</Text>
                </View>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Description</Text>
                  <Text variant="body-3" color="neutral-faded">
                    {lastConversation?.summary || actionPlan.whyStrategy || 'Customer requires follow-up based on recent interactions.'}
                  </Text>
                </View>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Priority</Text>
                  <CustomBadge color={actionPlan.badge === 'at-risk' ? 'critical' : 'warning'}>
                    High
                  </CustomBadge>
                </View>
                <View direction="column" gap={1}>
                  <Text variant="caption-1" color="neutral-faded">Origin</Text>
                  <Text variant="body-2">Phone (Mindi)</Text>
                </View>
              </View>
              
              <Button icon={<CheckCircle />}>
                ✓ Create Case
              </Button>
            </View>
          </Card>
        </View>

        {/* Action Status Bar */}
        <Card padding={6}>
          <View direction="row" gap={3} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
            <View direction="column" gap={1}>
              <Text variant="title-5" weight="bold">Action Status</Text>
              <Text variant="body-3" color="neutral-faded">
                Complete this action to move to the next customer interaction
              </Text>
            </View>
            {(actionPlan.status === 'active' || actionPlan.status === 'completed') && (
              <Button 
                onClick={actionPlan.status === 'completed' ? handleMarkIncomplete : handleMarkComplete}
                disabled={isUpdatingStatus}
                icon={<CheckCircle />}
                variant={actionPlan.status === 'completed' ? 'outline' : undefined}
              >
                {isUpdatingStatus
                  ? 'Updating...'
                  : actionPlan.status === 'completed'
                    ? 'Mark Action as Incomplete'
                    : '✓ Mark Action as Complete'}
              </Button>
            )}
            {actionPlan.status === 'completed' && !isUpdatingStatus && (
              <CustomBadge color="positive">Completed</CustomBadge>
            )}
          </View>
        </Card>
      </View>

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
