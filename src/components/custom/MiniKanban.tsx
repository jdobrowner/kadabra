import { Text, View, Card, Icon } from 'reshaped'
import { RowCard } from './RowCard'
import { CustomBadge } from './Badge'
import { ChalkboardSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useBoardsStore, type BoardCard } from '../../store/useBoardsStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { trpcVanillaClient } from '../../lib/trpc-client'

export interface MiniKanbanProps {
  onCardClick?: (cardId: string, boardId: string) => void
}

interface AssignedCard extends BoardCard {
  boardId: string
  boardName: string
}

export function MiniKanban({ onCardClick }: MiniKanbanProps) {
  const boards = useBoardsStore((state) => state.boards)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [assignedCards, setAssignedCards] = useState<AssignedCard[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all boards on mount
  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // Fetch all board details and collect assigned cards
  useEffect(() => {
    if (!user || boards.length === 0) {
      setAssignedCards([])
      return
    }

    const loadAssignedCards = async () => {
      setLoading(true)
      const allCards: AssignedCard[] = []

      try {
        // Fetch details for each board
        for (const board of boards) {
          try {
            const boardDetail = await trpcVanillaClient.boards.detail.query({ id: board.id })
            
            // Filter cards assigned to current user
            const userCards = boardDetail.cards
              .filter((card) => card.assigneeUserId === user.id && card.status === 'active')
              .map((card) => ({
                ...card,
                boardId: board.id,
                boardName: board.name,
              }))

            allCards.push(...userCards)
          } catch (error) {
            console.error(`Failed to fetch board ${board.id}:`, error)
          }
        }

        // Sort by updatedAt (most recent first) and limit to top 5
        const sortedCards = allCards
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)

        setAssignedCards(sortedCards)
      } catch (error) {
        console.error('Failed to load assigned cards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssignedCards()
  }, [boards, user])

  const handleCardClick = (cardId: string, boardId: string) => {
    if (onCardClick) {
      onCardClick(cardId, boardId)
    } else {
      navigate(`/boards/${boardId}`)
    }
  }

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        <View direction="column" gap={2}>
          <View direction="row" gap={2} align="center">
            <div>
              <Icon svg={<ChalkboardSimple weight="bold" size={20} />} size={5} />
            </div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>Your Cards</h3>
          </View>
        </View>

        {loading ? (
          <Text variant="body-2" color="neutral-faded">
            Loading...
          </Text>
        ) : assignedCards.length === 0 ? (
          <Text variant="body-2" color="neutral-faded">
            No assigned cards
          </Text>
        ) : (
          <View direction="column" gap={2}>
            {assignedCards.map((card, index) => (
              <RowCard
                key={card.id}
                padding={4}
                noBorderBottom={true}
                onClick={() => handleCardClick(card.id, card.boardId)}
                attributes={{
                  style: {
                    border: '1px solid var(--rs-color-border-neutral-faded)',
                    borderRadius: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }
                }}
              >
                <View direction="column" gap={2} attributes={{ style: { width: '100%' } }}>
                  {/* Top row: Card ID (left) and Board badge (right) */}
                  <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between', width: '100%' } }}>
                    <Text variant="caption-1" weight="medium" color="neutral-faded" attributes={{ style: { textTransform: 'uppercase', letterSpacing: '0.5px' } }}>
                      {card.id.slice(-6)}
                    </Text>
                    <CustomBadge color="primary" size="small">
                      {card.boardName}
                    </CustomBadge>
                  </View>
                  {/* Bottom row: Card title */}
                  <Text variant="body-2" weight="medium" attributes={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                    {card.title}
                  </Text>
                </View>
              </RowCard>
            ))}
          </View>
        )}
      </View>
    </Card>
  )
}
