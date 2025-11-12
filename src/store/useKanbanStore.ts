import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

const STORAGE_KEY = 'kadabra:kanban'

export interface KanbanCard {
  id: string
  columnId: string
  title: string
  description?: string
  labels?: string[]
  dueDate?: string | null
  assignee?: string | null
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: string
  title: string
  cardIds: string[]
  createdAt: string
  updatedAt: string
}

export interface KanbanState {
  columns: KanbanColumn[]
  cards: Record<string, KanbanCard>

  addColumn: (title?: string) => string
  updateColumn: (columnId: string, updates: Partial<Omit<KanbanColumn, 'id' | 'cardIds'>>) => void
  removeColumn: (columnId: string) => void
  reorderColumns: (activeId: string, overId: string) => void

  addCard: (columnId: string, card: Pick<KanbanCard, 'title' | 'description' | 'labels' | 'dueDate' | 'assignee'>) => string
  updateCard: (cardId: string, updates: Partial<Omit<KanbanCard, 'id' | 'columnId'>>) => void
  moveCard: (cardId: string, toColumnId: string, position?: number) => void
  reorderCardWithinColumn: (columnId: string, activeId: string, overId: string) => void
  removeCard: (cardId: string) => void

  hydrateBoard: (columns: KanbanColumn[], cards: KanbanCard[]) => void
}

const now = () => new Date().toISOString()

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cardIds: [],
          createdAt: now(),
          updatedAt: now(),
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          cardIds: [],
          createdAt: now(),
          updatedAt: now(),
        },
        {
          id: 'done',
          title: 'Done',
          cardIds: [],
          createdAt: now(),
          updatedAt: now(),
        },
      ],
      cards: {},

      addColumn: (title = 'New Column') => {
        const columnId = nanoid()
        const timestamp = now()

        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: columnId,
              title,
              cardIds: [],
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
        }))

        return columnId
      },

      updateColumn: (columnId, updates) => {
        const timestamp = now()
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  ...updates,
                  updatedAt: timestamp,
                }
              : column
          ),
        }))
      },

      removeColumn: (columnId) => {
        set((state) => {
          const nextColumns = state.columns.filter((column) => column.id !== columnId)
          const cardIdsToRemove = new Set(
            state.columns.find((column) => column.id === columnId)?.cardIds ?? []
          )

          if (nextColumns.length === state.columns.length) {
            return state
          }

          const nextCards = { ...state.cards }
          for (const cardId of cardIdsToRemove) {
            delete nextCards[cardId]
          }

          return {
            columns: nextColumns,
            cards: nextCards,
          }
        })
      },

      reorderColumns: (activeId, overId) => {
        if (activeId === overId) {
          return
        }

        set((state) => {
          const activeIndex = state.columns.findIndex((column) => column.id === activeId)
          const overIndex = state.columns.findIndex((column) => column.id === overId)

          if (activeIndex === -1 || overIndex === -1) {
            return state
          }

          const nextColumns = [...state.columns]
          const [movedColumn] = nextColumns.splice(activeIndex, 1)
          nextColumns.splice(overIndex, 0, movedColumn)

          return { columns: nextColumns }
        })
      },

      addCard: (columnId, cardInput) => {
        const column = get().columns.find((item) => item.id === columnId)
        if (!column) {
          throw new Error(`Column ${columnId} does not exist`)
        }

        const cardId = nanoid()
        const timestamp = now()

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              id: cardId,
              columnId,
              title: cardInput.title,
              description: cardInput.description,
              labels: cardInput.labels,
              dueDate: cardInput.dueDate ?? null,
              assignee: cardInput.assignee ?? null,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          },
          columns: state.columns.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  cardIds: [...col.cardIds, cardId],
                  updatedAt: timestamp,
                }
              : col
          ),
        }))

        return cardId
      },

      updateCard: (cardId, updates) => {
        const timestamp = now()
        set((state) => {
          const card = state.cards[cardId]
          if (!card) {
            return state
          }

          const nextCard: KanbanCard = {
            ...card,
            ...updates,
            updatedAt: timestamp,
          }

          return {
            cards: {
              ...state.cards,
              [cardId]: nextCard,
            },
          }
        })
      },

      moveCard: (cardId, toColumnId, position) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card) {
            return state
          }

          const sourceColumnIndex = state.columns.findIndex((column) => column.id === card.columnId)
          const targetColumnIndex = state.columns.findIndex((column) => column.id === toColumnId)

          if (sourceColumnIndex === -1 || targetColumnIndex === -1) {
            return state
          }

          const sourceColumn = state.columns[sourceColumnIndex]
          const targetColumn = state.columns[targetColumnIndex]

          const updatedSourceCardIds = sourceColumn.cardIds.filter((id) => id !== cardId)
          const updatedTargetCardIds = [...targetColumn.cardIds]

          const nextPosition =
            position === undefined
              ? updatedTargetCardIds.length
              : Math.max(0, Math.min(position, updatedTargetCardIds.length))

          updatedTargetCardIds.splice(nextPosition, 0, cardId)

          const timestamp = now()

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                columnId: toColumnId,
                updatedAt: timestamp,
              },
            },
            columns: state.columns.map((column) => {
              if (column.id === sourceColumn.id) {
                return {
                  ...column,
                  cardIds: updatedSourceCardIds,
                  updatedAt: timestamp,
                }
              }

              if (column.id === targetColumn.id) {
                return {
                  ...column,
                  cardIds: updatedTargetCardIds,
                  updatedAt: timestamp,
                }
              }

              return column
            }),
          }
        })
      },

      reorderCardWithinColumn: (columnId, activeId, overId) => {
        if (activeId === overId) {
          return
        }

        set((state) => {
          const column = state.columns.find((col) => col.id === columnId)
          if (!column) {
            return state
          }

          const activeIndex = column.cardIds.indexOf(activeId)
          const overIndex = column.cardIds.indexOf(overId)

          if (activeIndex === -1 || overIndex === -1) {
            return state
          }

          const nextCardIds = [...column.cardIds]
          nextCardIds.splice(activeIndex, 1)
          nextCardIds.splice(overIndex, 0, activeId)

          const timestamp = now()

          return {
            columns: state.columns.map((col) =>
              col.id === columnId
                ? {
                    ...col,
                    cardIds: nextCardIds,
                    updatedAt: timestamp,
                  }
                : col
            ),
          }
        })
      },

      removeCard: (cardId) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card) {
            return state
          }

          const nextColumns = state.columns.map((column) =>
            column.id === card.columnId
              ? {
                  ...column,
                  cardIds: column.cardIds.filter((id) => id !== cardId),
                  updatedAt: now(),
                }
              : column
          )

          const nextCards = { ...state.cards }
          delete nextCards[cardId]

          return {
            columns: nextColumns,
            cards: nextCards,
          }
        })
      },

      hydrateBoard: (columns, cards) => {
        const cardMap = cards.reduce<Record<string, KanbanCard>>((acc, card) => {
          acc[card.id] = card
          return acc
        }, {})

        set({
          columns,
          cards: cardMap,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
      }),
    }
  )
)


