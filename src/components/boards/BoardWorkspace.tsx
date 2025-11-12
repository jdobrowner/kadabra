import { useMemo, useState } from 'react'
import { View, Text, Card, Button } from 'reshaped'
import type { BoardDetail, BoardCard } from '../../store/useBoardsStore'
import type { TeamSummary } from '../../store/useTeamsStore'

interface BoardWorkspaceProps {
  board: BoardDetail | null
  teams: TeamSummary[]
  loading?: boolean
  onCreateCard: (columnId: string, payload: { title: string; description?: string }) => Promise<void>
  onUpdateCard: (cardId: string, payload: Partial<Pick<BoardCard, 'title' | 'description' | 'status' | 'assigneeTeamId'>>) => Promise<void>
  onMoveCard: (cardId: string, columnId: string, position: number) => Promise<void>
  onDeleteCard: (cardId: string) => Promise<void>
}

export function BoardWorkspace({
  board,
  teams,
  loading,
  onCreateCard,
  onUpdateCard,
  onMoveCard,
  onDeleteCard,
}: BoardWorkspaceProps) {
  const [newTitles, setNewTitles] = useState<Record<string, string>>({})
  const [newDescriptions, setNewDescriptions] = useState<Record<string, string>>({})
  const [isSubmittingCol, setIsSubmittingCol] = useState<Record<string, boolean>>({})

  const columnsWithCards = useMemo(() => {
    if (!board) {
      return []
    }
    return board.columns.map((column) => ({
      column,
      cards: board.cards
        .filter((card) => card.columnId === column.id)
        .sort((a, b) => a.position - b.position),
    }))
  }, [board])

  const moveOptions = useMemo(
    () =>
      board?.columns
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((col) => ({ id: col.id, name: col.name })) ?? [],
    [board?.columns]
  )

  if (loading) {
    return (
      <View padding={8} align="center" justify="center">
        <Text variant="body-2" color="neutral-faded">
          Loading board…
        </Text>
      </View>
    )
  }

  if (!board) {
    return (
      <Card padding={6}>
        <View direction="column" gap={3}>
          <Text variant="title-5" weight="bold">
            Select a board
          </Text>
          <Text variant="body-2" color="neutral-faded">
            Choose a board from the directory to view its workflow. Boards include columns, cards,
            and team assignments so you can track execution across teams.
          </Text>
        </View>
      </Card>
    )
  }

  const handleCreateCard = async (columnId: string) => {
    const title = newTitles[columnId]?.trim()
    if (!title) {
      return
    }
    setIsSubmittingCol((prev) => ({ ...prev, [columnId]: true }))
    try {
      await onCreateCard(columnId, {
        title,
        description: newDescriptions[columnId]?.trim() || undefined,
      })
      setNewTitles((prev) => ({ ...prev, [columnId]: '' }))
      setNewDescriptions((prev) => ({ ...prev, [columnId]: '' }))
    } finally {
      setIsSubmittingCol((prev) => ({ ...prev, [columnId]: false }))
    }
  }

  const handleToggleStatus = async (card: BoardCard) => {
    await onUpdateCard(card.id, {
      status: card.status === 'done' ? 'active' : 'done',
    })
  }

  const handleChangeAssignee = async (card: BoardCard, nextTeamId: string | null) => {
    await onUpdateCard(card.id, {
      assigneeTeamId: nextTeamId,
    })
  }

  const handleMoveCard = async (card: BoardCard, targetColumnId: string) => {
    const position = board.cards.filter((c) => c.columnId === targetColumnId && c.id !== card.id).length
    await onMoveCard(card.id, targetColumnId, position)
  }

  return (
    <View direction="column" gap={4}>
      <View direction="row" justify="space-between" align="center">
        <View direction="column" gap={1}>
          <Text variant="title-4" weight="bold">
            {board.board.name}
          </Text>
          {board.board.description && (
            <Text variant="body-2" color="neutral-faded">
              {board.board.description}
            </Text>
          )}
        </View>
      </View>

      <View
        direction="row"
        gap={4}
        align="start"
        wrap
        attributes={{
          style: {
            overflowX: 'auto',
            paddingBottom: '8px',
          },
        }}
      >
        {columnsWithCards.map(({ column, cards }) => (
          <View
            key={column.id}
            direction="column"
            gap={3}
            attributes={{
              style: { minWidth: '280px', maxWidth: '320px' },
            }}
          >
            <Card padding={4} attributes={{ style: { backgroundColor: 'var(--rs-color-background-neutral)' } }}>
              <View direction="column" gap={3}>
                <View direction="row" justify="space-between" align="center">
                  <View direction="column" gap={1}>
                    <Text variant="body-2" weight="bold">
                      {column.name}
                    </Text>
                    <Text variant="caption-1" color="neutral-faded">
                      {cards.length} card{cards.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>

                <View direction="column" gap={3}>
                  {cards.length === 0 ? (
                    <Text variant="caption-1" color="neutral-faded">
                      No cards yet
                    </Text>
                  ) : (
                    cards.map((card) => (
                      <Card key={card.id} padding={4}>
                        <View direction="column" gap={3}>
                          <View direction="column" gap={1}>
                            <Text variant="body-2" weight="medium">
                              {card.title}
                            </Text>
                            {card.description && (
                              <Text variant="caption-1" color="neutral-faded">
                                {card.description}
                              </Text>
                            )}
                          </View>

                          <View direction="column" gap={2}>
                            <View direction="row" gap={2} align="center">
                              <Text variant="caption-2" color="neutral-faded">
                                Team
                              </Text>
                              <select
                                value={card.assigneeTeamId ?? ''}
                                onChange={(event) => handleChangeAssignee(card, event.target.value || null)}
                                style={{
                                  flex: 1,
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--rs-color-border-neutral)',
                                  backgroundColor: 'var(--rs-color-background-neutral)',
                                  fontSize: '12px',
                                }}
                              >
                                <option value="">Unassigned</option>
                                {teams.map((team) => (
                                  <option key={team.id} value={team.id}>
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                            </View>

                            <View direction="row" gap={2} wrap>
                              <select
                                value={card.columnId}
                                onChange={(event) => handleMoveCard(card, event.target.value)}
                                style={{
                                  flex: 1,
                                  minWidth: '120px',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--rs-color-border-neutral)',
                                  backgroundColor: 'var(--rs-color-background-neutral)',
                                  fontSize: '12px',
                                }}
                              >
                                {moveOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    Move to {option.name}
                                  </option>
                                ))}
                              </select>
                              <Button size="small" variant="ghost" onClick={() => handleToggleStatus(card)}>
                                {card.status === 'done' ? 'Reopen' : 'Mark done'}
                              </Button>
                              <Button size="small" variant="ghost" color="critical" onClick={() => onDeleteCard(card.id)}>
                                Delete
                              </Button>
                            </View>
                          </View>
                        </View>
                      </Card>
                    ))
                  )}
                </View>

                <Card
                  padding={4}
                  attributes={{
                    style: {
                      backgroundColor: 'var(--rs-color-background-neutral-stronger)',
                    },
                  }}
                >
                  <View direction="column" gap={2}>
                    <Text variant="caption-1" weight="medium">
                      Add card
                    </Text>
                    <input
                      value={newTitles[column.id] ?? ''}
                      onChange={(event) =>
                        setNewTitles((prev) => ({
                          ...prev,
                          [column.id]: event.target.value,
                        }))
                      }
                      placeholder="Card title"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--rs-color-border-neutral)',
                        backgroundColor: 'var(--rs-color-background-neutral)',
                        fontSize: '13px',
                      }}
                    />
                    <textarea
                      value={newDescriptions[column.id] ?? ''}
                      onChange={(event) =>
                        setNewDescriptions((prev) => ({
                          ...prev,
                          [column.id]: event.target.value,
                        }))
                      }
                      placeholder="Description (optional)"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--rs-color-border-neutral)',
                        backgroundColor: 'var(--rs-color-background-neutral)',
                        fontSize: '13px',
                      }}
                    />
                    <Button
                      size="small"
                      disabled={!newTitles[column.id]?.trim() || isSubmittingCol[column.id]}
                      onClick={() => handleCreateCard(column.id)}
                    >
                      {isSubmittingCol[column.id] ? 'Adding…' : 'Add card'}
                    </Button>
                  </View>
                </Card>
              </View>
            </Card>
          </View>
        ))}
      </View>
    </View>
  )
}

