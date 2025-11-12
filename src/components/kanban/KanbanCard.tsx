import { useMemo, useState } from 'react'
import { Card, Text, View, Button, TextField, TextArea, Icon } from 'reshaped'
import { PencilSimple, Trash, DotsSixVertical } from '@phosphor-icons/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { KanbanCard as KanbanCardModel } from '../../store/useKanbanStore'

export interface KanbanCardProps {
  card: KanbanCardModel
  onUpdate: (updates: Partial<Omit<KanbanCardModel, 'id' | 'columnId'>>) => void
  onDelete: () => void
}

export function KanbanCardItem({ card, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({
    title: card.title,
    description: card.description ?? '',
  })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      columnId: card.columnId,
    },
  })

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.65 : 1,
    }),
    [transform, transition, isDragging]
  )

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      return
    }
    onUpdate({
      title: formState.title.trim(),
      description: formState.description.trim() || undefined,
    })
    setIsEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card padding={4} attributes={{ style: { backgroundColor: 'var(--rs-color-background-surface)' } }}>
        <View direction="column" gap={3}>
          <View direction="row" justify="space-between" align="start" gap={2}>
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
              {isEditing ? (
                <TextField
                  name={`card-title-${card.id}`}
                  placeholder="Card title"
                  value={formState.title}
                  onChange={(value) => {
                    if (typeof value === 'string') {
                      setFormState((prev) => ({ ...prev, title: value }))
                    }
                  }}
                />
              ) : (
                <Text variant="body-2" weight="medium">
                  {card.title}
                </Text>
              )}
            </View>
            <View direction="row" gap={1}>
              {isEditing ? (
                <Button size="small" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outline"
                  icon={<Icon svg={<PencilSimple weight="bold" />} size={4} />}
                  onClick={() => {
                    setIsEditing(true)
                    setFormState({
                      title: card.title,
                      description: card.description ?? '',
                    })
                  }}
                >
                  Edit
                </Button>
              )}
              <Button
                size="small"
                variant="outline"
                icon={<Icon svg={<Trash weight="bold" />} size={4} />}
                onClick={onDelete}
              >
                Delete
              </Button>
            </View>
          </View>

          {isEditing ? (
            <View direction="column" gap={3}>
              <TextArea
                name={`card-description-${card.id}`}
                placeholder="Details (optional)"
                value={formState.description}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setFormState((prev) => ({ ...prev, description: value }))
                  }
                }}
              />
              <View direction="row" gap={2} justify="end">
                <Button size="small" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="small" onClick={handleSubmit}>
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <>
              {card.description && (
                <Text variant="body-3" color="neutral-faded">
                  {card.description}
                </Text>
              )}
              <View direction="row" gap={2} wrap>
                {card.labels?.map((label) => (
                  <View
                    key={label}
                    padding={1}
                    attributes={{
                      style: {
                        backgroundColor: 'var(--rs-color-background-primary-muted)',
                        borderRadius: '12px',
                      },
                    }}
                  >
                    <Text variant="caption-1" weight="medium" color="primary">
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
              {card.dueDate && (
                <Text variant="caption-1" color="warning">
                  Due {new Date(card.dueDate).toLocaleDateString()}
                </Text>
              )}
              {card.assignee && (
                <Text variant="caption-1" color="neutral-faded">
                  Assigned to {card.assignee}
                </Text>
              )}
            </>
          )}
        </View>
      </Card>
    </div>
  )
}


