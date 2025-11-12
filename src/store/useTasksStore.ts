import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface Task {
  id: string
  customerId?: string | null
  conversationId?: string | null
  actionPlanId?: string | null
  title: string
  description?: string | null
  priority: string
  status: string
  dueDate?: string | null
  ownerUserId?: string | null
  createdAt: string
  updatedAt: string
}

interface TasksState {
  // List state
  tasks: Task[]
  tasksLoading: boolean
  tasksError: Error | null
  tasksFilters: {
    customerId?: string
    status?: 'all' | 'todo' | 'in_progress' | 'done'
    priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  }
  
  // Actions
  fetchTasks: (filters?: TasksState['tasksFilters']) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>
  removeTask: (taskId: string) => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  // Initial state
  tasks: [],
  tasksLoading: false,
  tasksError: null,
  tasksFilters: {},
  
  // Fetch tasks
  fetchTasks: async (filters = {}) => {
    set({ tasksLoading: true, tasksError: null })
    
    try {
      const result = await trpcVanillaClient.tasks.list.query(filters)
      set({
        tasks: result,
        tasksLoading: false,
        tasksFilters: filters,
      })
    } catch (error) {
      set({
        tasksError: error instanceof Error ? error : new Error('Failed to fetch tasks'),
        tasksLoading: false,
      })
    }
  },
  
  // Create task
  createTask: async (taskData) => {
    try {
      const result = await trpcVanillaClient.tasks.create.mutate({
        customerId: taskData.customerId!,
        conversationId: taskData.conversationId ?? undefined,
        actionPlanId: taskData.actionPlanId ?? undefined,
        title: taskData.title,
        description: taskData.description ?? undefined,
        priority: taskData.priority as any,
        dueDate: taskData.dueDate ?? undefined,
        ownerUserId: taskData.ownerUserId ?? undefined,
      })
      set((state) => ({
        tasks: [result.task, ...state.tasks],
      }))
    } catch (error) {
      throw error
    }
  },
  
  // Update task
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    }))
  },
  
  // Update task status
  updateTaskStatus: async (taskId, status) => {
    try {
      await trpcVanillaClient.tasks.updateStatus.mutate({ id: taskId, status: status as any })
      get().updateTask(taskId, { status })
    } catch (error) {
      throw error
    }
  },
  
  // Remove task
  removeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }))
  },
}))

