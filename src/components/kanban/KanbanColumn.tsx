import { useEffect, useMemo, useState } from 'react'
import { View, Text, Card, Button, TextField, TextArea, Icon } from 'reshaped'
import { Plus, Trash, PencilSimple, DotsSixVertical } from '@phosphor-icons/react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import type { KanbanColumn as KanbanColumnModel, KanbanCard as KanbanCardModel } from '../../store/useKanbanStore'
import { KanbanCardItem } from './KanbanCard'

export interface KanbanColumnProps {
  column: KanbanColumnModel
  cards: KanbanCardModel[]
  onAddCard: (title: string, description?: string) => void
  onRenameColumn: (title: string) => void
  onDeleteColumn: () => void
  onUpdateCard: (cardId: string, updates: Partial<Omit<KanbanCardModel, 'id' | 'columnId'>>) => void
  onDeleteCard: (cardId: string) => void
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onRenameColumn,
  onDeleteColumn,
  onUpdateCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(column.title)
  const [cardForm, setCardForm] = useState({ title: '', description: '' })

  useEffect(() => {
    setTitleInput(column.title)
  }, [column.title])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  })

  const sortableStyle = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.75 : 1,
    }),
    [transform, transition, isDragging]
  )

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `column-drop-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  const handleAddCard = () => {
    if (!cardForm.title.trim()) {
      return
    }

    onAddCard(cardForm.title.trim(), cardForm.description.trim() || undefined)
    setCardForm({ title: '', description: '' })
    setIsAddingCard(false)
  }

  const handleRenameColumn = () => {
    if (!titleInput.trim() || titleInput === column.title) {
      setIsEditingTitle(false)
      return
    }
    onRenameColumn(titleInput.trim())
    setIsEditingTitle(false)
  }

  return (
    <div ref={setNodeRef} style={{ width: '280px', ...sortableStyle }}>
      <Card padding={4} attributes={{ style: { height: '100%', backgroundColor: 'var(--rs-color-background-surface)' } }}>
        <View direction="column" gap={4} attributes={{ style: { height: '100%' } }}>
          <View direction="row" justify="space-between" align="center" gap={2}>
            <View
              direction="row"
              gap={2}
              align="center"
              attributes={{
                ...attributes,
                ...listeners,
                style: { cursor: 'grab', userSelect: 'none' },
              }}
            >
              <Icon svg={<DotsSixVertical weight="bold" />} size={4} color="neutral-faded" />
              {isEditingTitle ? (
                <TextField
                  name={`column-title-${column.id}`}
                  placeholder="Column title"
                  value={titleInput}
                  onChange={(value) => {
                    if (typeof value === 'string') {
                      setTitleInput(value)
                    }
                  }}
                  onBlur={handleRenameColumn}
                  inputAttributes={{ autoFocus: true }}
                />
              ) : (
                <Text variant="body-2" weight="bold">
                  {column.title}
                </Text>
              )}
              <Text variant="caption-1" color="neutral-faded">
                {cards.length}
              </Text>
            </View>

            <View direction="row" gap={1}>
              <Button
                size="small"
                variant="outline"
                icon={<Icon svg={<PencilSimple weight="bold" />} size={4} />}
                onClick={() => setIsEditingTitle((prev) => !prev)}
              >
                Rename
              </Button>
              <Button
                size="small"
                variant="outline"
                icon={<Icon svg={<Trash weight="bold" />} size={4} />}
                onClick={onDeleteColumn}
              >
                Delete
              </Button>
            </View>
          </View>

          <div
            ref={setDropRef}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '4px',
              margin: '-4px',
              borderRadius: '8px',
              minHeight: '80px',
              backgroundColor: isOver ? 'var(--rs-color-background-neutral-muted)' : 'transparent',
              transition: 'background-color 0.15s ease',
            }}
          >
            <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
              <View direction="column" gap={3}>
                {cards.map((card) => (
                  <KanbanCardItem
                    key={card.id}
                    card={card}
                    onUpdate={(updates) => onUpdateCard(card.id, updates)}
                    onDelete={() => onDeleteCard(card.id)}
                  />
                ))}
                {cards.length === 0 && !isAddingCard && (
                  <View
                    padding={3}
                    align="center"
                    justify="center"
                    attributes={{
                      style: {
                        border: '1px dashed var(--rs-color-border-neutral-muted)',
                        borderRadius: '8px',
                        color: 'var(--rs-color-foreground-neutral-muted)',
                        fontSize: '12px',
                      },
                    }}
                  >
                    <Text variant="caption-1" color="neutral-faded">
                      Drop cards or add a new one
                    </Text>
                  </View>
                )}
              </View>
            </SortableContext>
          </div>

          {isAddingCard ? (
            <View direction="column" gap={3}>
              <TextField
                name={`card-title-input-${column.id}`}
                placeholder="Card title"
                value={cardForm.title}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setCardForm((prev) => ({ ...prev, title: value }))
                  }
                }}
              />
              <TextArea
                name={`card-description-input-${column.id}`}
                placeholder="Description (optional)"
                value={cardForm.description}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setCardForm((prev) => ({ ...prev, description: value }))
                  }
                }}
              />
              <View direction="row" gap={2} justify="end">
                <Button size="small" variant="outline" onClick={() => setIsAddingCard(false)}>
                  Cancel
                </Button>
                <Button size="small" onClick={handleAddCard}>
                  Add Card
                </Button>
              </View>
            </View>
          ) : (
            <Button
              icon={<Icon svg={<Plus weight="bold" />} size={4} />}
              variant="outline"
              onClick={() => setIsAddingCard(true)}
            >
              Add Card
            </Button>
          )}
        </View>
      </Card>
    </div>
  )
}


