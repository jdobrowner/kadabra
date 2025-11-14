import { Text, View } from 'reshaped'
import { ContainerCard } from './ContainerCard'
import { ElevatedCard } from './ElevatedCard'
import { Columns } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useKanbanStore } from '../../store/useKanbanStore'

export interface MiniKanbanProps {
  onTaskClick?: (taskId: string) => void
}

export function MiniKanban({ onTaskClick }: MiniKanbanProps) {
  const columns = useKanbanStore((state) => state.columns)
  const cards = useKanbanStore((state) => state.cards)

  const columnSummaries = useMemo(
    () =>
      columns.map((column, index) => ({
        ...column,
        accentColor: getAccentColor(index),
        items: column.cardIds
          .map((cardId) => cards[cardId])
          .filter((card): card is NonNullable<typeof card> => Boolean(card))
          .slice(0, 3),
      })),
    [columns, cards]
  )

  return (
    <ContainerCard padding={6}>
      <View direction="column" gap={4}>
        <View direction="row" gap={2} align="center">
          <Columns size={20} weight="bold" />
          <Text variant="title-4" weight="bold">
            Open Tasks
          </Text>
        </View>

        <View direction="row" gap={4} attributes={{ style: { overflowX: 'auto' } }}>
          {columnSummaries.map((column) => (
            <View key={column.id} direction="column" gap={2} attributes={{ style: { minWidth: '200px', flex: 1 } }}>
              <View direction="row" align="center" gap={2}>
                <View
                  attributes={{
                    style: {
                      width: '8px',
                      height: '8px',
                      borderRadius: '30px',
                      backgroundColor: column.accentColor,
                    },
                  }}
                />
                <Text variant="body-2" weight="medium" color="neutral-faded">
                  {column.title} ({column.cardIds.length})
                </Text>
              </View>
              <View direction="column" gap={2}>
                {column.items.map((card) => (
                  <ElevatedCard
                    key={card.id}
                    padding={3}
                    onClick={onTaskClick ? () => onTaskClick(card.id) : undefined}
                    attributes={{
                      style: {
                        borderLeft: `3px solid ${column.accentColor}`,
                      }
                    }}
                  >
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
                  </ElevatedCard>
                ))}
                {column.items.length === 0 && (
                  <Text variant="body-3" color="neutral-faded">
                    No cards yet
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ContainerCard>
  )
}

function getAccentColor(index: number) {
  const palette = [
    'var(--rs-color-primary)',
    'var(--rs-color-positive)',
    'var(--rs-color-warning)',
    'var(--rs-color-critical)',
  ]
  return palette[index % palette.length]
}
