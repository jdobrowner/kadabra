import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

export interface BoardSummary {
  id: string
  name: string
  description: string | null
  visibility: 'org' | 'team'
  cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom'
  defaultTeamId: string | null
  isEditable: boolean
  permissions: Array<{ teamId: string; mode: 'edit' | 'view' }>
  createdAt: string
  updatedAt: string
}

export interface BoardColumn {
  id: string
  name: string
  position: number
  wipLimit: number | null
  createdAt: string
  updatedAt: string
}

export interface BoardCard {
  id: string
  actionPlanId: string | null
  customerId: string | null
  columnId: string
  title: string
  description: string | null
  type: string
  status: 'active' | 'done' | 'archived'
  position: number
  dueDate: string | null
  assigneeUserId: string | null
  assigneeTeamId: string | null
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

export interface BoardPermission {
  id: string
  teamId: string
  mode: 'edit' | 'view'
}

export interface BoardDetail {
  board: BoardSummary
  columns: BoardColumn[]
  cards: BoardCard[]
  permissions: BoardPermission[]
}

interface BoardsState {
  boards: BoardSummary[]
  boardsLoading: boolean
  boardsError: Error | null

  selectedBoard: BoardDetail | null
  boardLoading: boolean
  boardError: Error | null

  fetchBoards: () => Promise<void>
  fetchBoard: (id: string) => Promise<void>
  createBoard: (input: {
    name: string
    description?: string
    visibility: 'org' | 'team'
    cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom'
    defaultTeamId?: string | null
    initialColumns?: Array<{ name: string }>
  }) => Promise<string>
  updateBoard: (input: {
    id: string
    name?: string
    description?: string | null
    visibility?: 'org' | 'team'
    cardType?: 'lead' | 'case' | 'deal' | 'task' | 'custom'
    defaultTeamId?: string | null
  }) => Promise<void>
  deleteBoard: (id: string) => Promise<void>

  createColumn: (boardId: string, name: string) => Promise<void>
  updateColumn: (input: { columnId: string; name?: string; wipLimit?: number | null }) => Promise<void>
  reorderColumns: (boardId: string, columnOrder: string[]) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>

  createCard: (input: {
    boardId: string
    columnId: string
    title: string
    description?: string
    status?: 'active' | 'done' | 'archived'
    type?: 'lead' | 'case' | 'deal' | 'task' | 'custom'
    assigneeTeamId?: string
    assigneeUserId?: string
    actionPlanId?: string
    metadata?: Record<string, any>
  }) => Promise<void>
  updateCard: (input: {
    cardId: string
    title?: string
    description?: string | null
    status?: 'active' | 'done' | 'archived'
    type?: 'lead' | 'case' | 'deal' | 'task' | 'custom'
    assigneeTeamId?: string | null
    assigneeUserId?: string | null
    metadata?: Record<string, any> | null
  }) => Promise<void>
  moveCard: (input: { cardId: string; columnId: string; position: number }) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  addPermission: (input: { boardId: string; teamId: string; mode: 'edit' | 'view' }) => Promise<void>
  removePermission: (permissionId: string) => Promise<void>
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  boardsLoading: false,
  boardsError: null,

  selectedBoard: null,
  boardLoading: false,
  boardError: null,

  fetchBoards: async () => {
    set({ boardsLoading: true, boardsError: null })
    try {
      const result = await trpcVanillaClient.boards.list.query()
      set({ boards: result, boardsLoading: false })
    } catch (error) {
      set({
        boardsError: error instanceof Error ? error : new Error('Failed to load boards'),
        boardsLoading: false,
      })
    }
  },

  fetchBoard: async (id) => {
    set({ boardLoading: true, boardError: null })
    try {
      const result = await trpcVanillaClient.boards.detail.query({ id })
      set({ selectedBoard: result, boardLoading: false })
    } catch (error) {
      set({
        boardError: error instanceof Error ? error : new Error('Failed to load board'),
        boardLoading: false,
      })
    }
  },

  createBoard: async (input) => {
    const result = await trpcVanillaClient.boards.create.mutate(input)
    await get().fetchBoards()
    return result.boardId
  },

  updateBoard: async (input) => {
    await trpcVanillaClient.boards.update.mutate(input)
    await Promise.all([get().fetchBoards(), get().fetchBoard(input.id)])
  },

  deleteBoard: async (id) => {
    await trpcVanillaClient.boards.delete.mutate({ id })
    set((state) => ({
      boards: state.boards.filter((board) => board.id !== id),
      selectedBoard: state.selectedBoard?.board.id === id ? null : state.selectedBoard,
    }))
  },

  createColumn: async (boardId, name) => {
    await trpcVanillaClient.boards.createColumn.mutate({ boardId, name })
    await get().fetchBoard(boardId)
  },

  updateColumn: async (input) => {
    await trpcVanillaClient.boards.updateColumn.mutate(input)
    const boardId = get().selectedBoard?.board.id
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },

  reorderColumns: async (boardId, columnOrder) => {
    await trpcVanillaClient.boards.reorderColumns.mutate({ boardId, columnOrder })
    await get().fetchBoard(boardId)
  },

  deleteColumn: async (columnId) => {
    const boardId = get().selectedBoard?.board.id
    await trpcVanillaClient.boards.deleteColumn.mutate({ columnId })
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },

  createCard: async (input) => {
    await trpcVanillaClient.boards.createCard.mutate(input)
    await get().fetchBoard(input.boardId)
  },

  updateCard: async (input) => {
    await trpcVanillaClient.boards.updateCard.mutate(input)
    const boardId = get().selectedBoard?.board.id
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },

  moveCard: async (input) => {
    await trpcVanillaClient.boards.moveCard.mutate(input)
    const boardId = get().selectedBoard?.board.id
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },

  deleteCard: async (cardId) => {
    await trpcVanillaClient.boards.deleteCard.mutate({ cardId })
    const boardId = get().selectedBoard?.board.id
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },

  addPermission: async (input) => {
    await trpcVanillaClient.boards.addPermission.mutate(input)
    await get().fetchBoard(input.boardId)
  },

  removePermission: async (permissionId) => {
    const boardId = get().selectedBoard?.board.id
    await trpcVanillaClient.boards.removePermission.mutate({ permissionId })
    if (boardId) {
      await get().fetchBoard(boardId)
    }
  },
}))
