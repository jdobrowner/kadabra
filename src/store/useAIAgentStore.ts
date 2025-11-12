import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

export type AiAgentMessageRole = 'user' | 'assistant'

export interface AiAgentChat {
  id: string
  customerId: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  messageCount: number
}

export interface AiAgentMessage {
  id: string
  chatId: string
  role: AiAgentMessageRole
  content: string
  createdAt: string
}

interface AiAgentState {
  chats: AiAgentChat[]
  chatsLoading: boolean
  chatsError: Error | null
  activeChatId: string | null
  currentCustomerId: string | null
  messagesByChat: Record<string, AiAgentMessage[]>
  messagesLoading: boolean
  sendingMessage: boolean
  sendError: Error | null

  fetchChats: (customerId: string) => Promise<void>
  loadChat: (chatId: string, options?: { force?: boolean }) => Promise<void>
  setActiveChat: (chatId: string | null) => void
  createChat: (customerId: string, title?: string) => Promise<AiAgentChat>
  deleteChat: (chatId: string) => Promise<void>
  sendMessage: (input: { chatId?: string; customerId?: string; message: string }) => Promise<{
    chat: AiAgentChat
    userMessage: AiAgentMessage
    assistantMessage: AiAgentMessage
  }>
  reset: () => void
}

function serializeDate(value: string | Date | null | undefined): string {
  if (!value) {
    return new Date().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return value.toISOString()
}

function serializeChat(chat: any): AiAgentChat {
  return {
    id: chat.id,
    customerId: chat.customerId,
    title: chat.title ?? 'New Chat',
    createdAt: serializeDate(chat.createdAt),
    updatedAt: serializeDate(chat.updatedAt),
    lastMessageAt: serializeDate(chat.lastMessageAt),
    messageCount: typeof chat.messageCount === 'number' ? chat.messageCount : Number(chat.messageCount ?? 0),
  }
}

function serializeMessage(message: any): AiAgentMessage {
  return {
    id: message.id,
    chatId: message.chatId,
    role: message.role,
    content: message.content,
    createdAt: serializeDate(message.createdAt),
  }
}

export const useAiAgentStore = create<AiAgentState>((set, get) => ({
  chats: [],
  chatsLoading: false,
  chatsError: null,
  activeChatId: null,
  currentCustomerId: null,
  messagesByChat: {},
  messagesLoading: false,
  sendingMessage: false,
  sendError: null,

  fetchChats: async (customerId) => {
    set({ chatsLoading: true, chatsError: null, currentCustomerId: customerId })

    try {
      const response = await trpcVanillaClient.aiAgent.listChats.query({ customerId })
      set({
        chats: response.map(serializeChat),
        chatsLoading: false,
        chatsError: null,
      })
    } catch (error) {
      set({
        chatsLoading: false,
        chatsError: error instanceof Error ? error : new Error('Failed to load AI chats'),
      })
    }
  },

  loadChat: async (chatId, options = {}) => {
    const { messagesByChat, activeChatId } = get()
    if (!options.force && messagesByChat[chatId] && activeChatId === chatId) {
      return
    }

    set({ messagesLoading: true })
    try {
      const response = await trpcVanillaClient.aiAgent.getChat.query({ chatId })
      const serializedMessages = response.messages.map(serializeMessage)
      const serializedChat = {
        ...serializeChat(response.chat),
        messageCount: serializedMessages.length,
      }

      set((state) => ({
        chats: state.chats.some((chat) => chat.id === serializedChat.id)
          ? state.chats.map((chat) => (chat.id === serializedChat.id ? serializedChat : chat))
          : [serializedChat, ...state.chats],
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: serializedMessages,
        },
        activeChatId: chatId,
        messagesLoading: false,
      }))
    } catch (error) {
      set({
        messagesLoading: false,
        chatsError: error instanceof Error ? error : new Error('Failed to load chat messages'),
      })
    }
  },

  setActiveChat: (chatId) => {
    set({ activeChatId: chatId })
  },

  createChat: async (customerId, title) => {
    try {
      const response = await trpcVanillaClient.aiAgent.createChat.mutate({ customerId, title })
      const chat = serializeChat(response)

      set((state) => ({
        chats: [chat, ...state.chats.filter((existing) => existing.id !== chat.id)],
        activeChatId: chat.id,
        messagesByChat: {
          ...state.messagesByChat,
          [chat.id]: [],
        },
      }))

      return chat
    } catch (error) {
      throw (error instanceof Error ? error : new Error('Failed to create chat'))
    }
  },

  deleteChat: async (chatId) => {
    try {
      await trpcVanillaClient.aiAgent.deleteChat.mutate({ chatId })
      set((state) => {
        const { [chatId]: _, ...restMessages } = state.messagesByChat
        return {
          chats: state.chats.filter((chat) => chat.id !== chatId),
          messagesByChat: restMessages,
          activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
        }
      })
    } catch (error) {
      throw (error instanceof Error ? error : new Error('Failed to delete chat'))
    }
  },

  sendMessage: async ({ chatId, customerId, message }) => {
    set({ sendingMessage: true, sendError: null })
    try {
      const response = await trpcVanillaClient.aiAgent.query.mutate({ chatId, customerId, message })
      const serializedUserMessage = serializeMessage(response.userMessage)
      const serializedAssistantMessage = serializeMessage(response.assistantMessage)
      const serializedChat = serializeChat(response.chat)
      let chatWithCount: AiAgentChat = {
        ...serializedChat,
        messageCount: 0,
      }

      set((state) => {
        const existingMessages = state.messagesByChat[serializedChat.id] ?? []
        const updatedMessages = [...existingMessages, serializedUserMessage, serializedAssistantMessage]

        chatWithCount = {
          ...serializedChat,
          messageCount: updatedMessages.length,
          lastMessageAt: serializedAssistantMessage.createdAt,
          updatedAt: serializedAssistantMessage.createdAt,
        }

        const updatedChats = state.chats.some((chat) => chat.id === chatWithCount.id)
          ? state.chats
              .map((chat) => (chat.id === chatWithCount.id ? chatWithCount : chat))
              .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
          : [chatWithCount, ...state.chats]

        return {
          chats: updatedChats,
          messagesByChat: {
            ...state.messagesByChat,
            [chatWithCount.id]: updatedMessages,
          },
          activeChatId: chatWithCount.id,
          sendingMessage: false,
        }
      })

      return {
        chat: chatWithCount,
        userMessage: serializedUserMessage,
        assistantMessage: serializedAssistantMessage,
      }
    } catch (error) {
      set({
        sendingMessage: false,
        sendError: error instanceof Error ? error : new Error('Failed to send AI message'),
      })
      throw (error instanceof Error ? error : new Error('Failed to send AI message'))
    }
  },

  reset: () => {
    set({
      chats: [],
      chatsLoading: false,
      chatsError: null,
      activeChatId: null,
      currentCustomerId: null,
      messagesByChat: {},
      messagesLoading: false,
      sendingMessage: false,
      sendError: null,
    })
  },
}))