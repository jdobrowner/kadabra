import { useMemo } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { View, Text, Button, Icon } from 'reshaped'
import { Plus } from '@phosphor-icons/react'
import { KanbanColumn } from './KanbanColumn'
import { useKanbanStore } from '../../store/useKanbanStore'
import type { DragEndEvent } from '@dnd-kit/core'

export function KanbanBoardView() {
  const columns = useKanbanStore((state) => state.columns)
  const cards = useKanbanStore((state) => state.cards)
  const addColumn = useKanbanStore((state) => state.addColumn)
  const updateColumn = useKanbanStore((state) => state.updateColumn)
  const removeColumn = useKanbanStore((state) => state.removeColumn)
  const reorderColumns = useKanbanStore((state) => state.reorderColumns)
  const addCard = useKanbanStore((state) => state.addCard)
  const updateCard = useKanbanStore((state) => state.updateCard)
  const moveCard = useKanbanStore((state) => state.moveCard)
  const reorderCardWithinColumn = useKanbanStore((state) => state.reorderCardWithinColumn)
  const removeCard = useKanbanStore((state) => state.removeCard)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 4,
      },
    })
  )

  const columnCards = useMemo(
    () =>
      columns.map((column) => ({
        column,
        cards: column.cardIds
          .map((cardId) => cards[cardId])
          .filter((card): card is NonNullable<typeof card> => Boolean(card)),
      })),
    [columns, cards]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      return
    }

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'column' && overType === 'column') {
      const activeId = String(active.id)
      const overId = String(over.id)
      reorderColumns(activeId, overId)
      return
    }

    if (activeType === 'card') {
      const activeCardId = String(active.id)
      const sourceColumnId = active.data.current?.columnId as string | undefined
      if (!sourceColumnId) {
        return
      }

      const overData = over.data.current
      const targetColumnId =
        (overData?.type === 'card' && (overData?.columnId as string)) ||
        (overData?.type === 'column' && (overData?.columnId as string)) ||
        (typeof over.id === 'string' ? over.id : undefined)

      if (!targetColumnId) {
        return
      }

      if (overData?.type === 'card' && targetColumnId === sourceColumnId) {
        reorderCardWithinColumn(sourceColumnId, activeCardId, String(over.id))
        return
      }

      const state = useKanbanStore.getState()
      const targetColumn = state.columns.find((column) => column.id === targetColumnId)
      if (!targetColumn) {
        return
      }

      const overCardId = overData?.type === 'card' ? String(over.id) : undefined
      const targetPosition =
        overCardId && targetColumn.cardIds.includes(overCardId)
          ? targetColumn.cardIds.indexOf(overCardId)
          : targetColumn.cardIds.length

      moveCard(activeCardId, targetColumnId, targetPosition)
    }
  }

  return (
    <View direction="column" gap={4}>
      <View direction="row" justify="space-between" align="center">
        <Text variant="title-4" weight="bold">
          Board
        </Text>
        <Button
          size="small"
          icon={<Icon svg={<Plus weight="bold" />} size={4} />}
          onClick={() => addColumn()}
          variant="outline"
        >
          Add Column
        </Button>
      </View>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
          <View
            direction="row"
            gap={4}
            attributes={{
              style: {
                overflowX: 'auto',
                paddingBottom: '12px',
                alignItems: 'flex-start',
              },
            }}
          >
            {columnCards.map(({ column, cards: columnCardItems }) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={columnCardItems}
                onAddCard={(title, description) => addCard(column.id, { title, description })}
                onRenameColumn={(title) => updateColumn(column.id, { title })}
                onDeleteColumn={() => removeColumn(column.id)}
                onUpdateCard={(cardId, updates) => updateCard(cardId, updates)}
                onDeleteCard={(cardId) => removeCard(cardId)}
              />
            ))}
          </View>
        </SortableContext>
      </DndContext>
    </View>
  )
}


