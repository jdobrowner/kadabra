import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, View, Text, Button, Icon, Loader, TextArea, DropdownMenu } from 'reshaped'
import { Plus, Trash, PaperPlaneTilt } from '@phosphor-icons/react'
import { useAiAgentStore } from '../../../store/useAIAgentStore'
import { formatRelativeTime } from '../../../utils/formatTime'
import './AIAgentPanel.css'

interface AIAgentPanelProps {
  customerId: string
  customerName?: string
  className?: string
}

export function AIAgentPanel({ customerId, customerName, className }: AIAgentPanelProps) {
  const {
    chats,
    chatsLoading,
    chatsError,
    activeChatId,
    messagesByChat,
    messagesLoading,
    sendingMessage,
    fetchChats,
    loadChat,
    setActiveChat,
    createChat,
    deleteChat,
    sendMessage,
    reset,
  } = useAiAgentStore()

  const [composerValue, setComposerValue] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchChats(customerId).catch((error) => {
      if (isMounted) {
        setLocalError(error instanceof Error ? error.message : 'Failed to load AI chats')
      }
    })

    return () => {
      isMounted = false
      reset()
      setComposerValue('')
      setLocalError(null)
      setCreating(false)
    }
  }, [customerId, fetchChats, reset])

  useEffect(() => {
    if (chats.length === 0) {
      setActiveChat(null)
      return
    }

    const currentActive = activeChatId ?? chats[0].id
    if (!activeChatId) {
      setActiveChat(currentActive)
    }

    if (!messagesByChat[currentActive]) {
      loadChat(currentActive).catch((error) => {
        setLocalError(error instanceof Error ? error.message : 'Failed to load chat messages')
      })
    }
  }, [chats, activeChatId, messagesByChat, setActiveChat, loadChat])

  const activeMessages = useMemo(() => {
    if (!activeChatId) {
      return []
    }
    return messagesByChat[activeChatId] ?? []
  }, [activeChatId, messagesByChat])

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChat(chatId)
      if (!messagesByChat[chatId]) {
        loadChat(chatId).catch((error) => {
          setLocalError(error instanceof Error ? error.message : 'Failed to load chat messages')
        })
      }
    },
    [messagesByChat, setActiveChat, loadChat]
  )

  const handleCreateChat = useCallback(async () => {
    setCreating(true)
    setLocalError(null)
    try {
      const chat = await createChat(customerId)
      await loadChat(chat.id, { force: true })
      setComposerValue('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to create chat')
    } finally {
      setCreating(false)
    }
  }, [createChat, loadChat, customerId])

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      const confirmed = window.confirm('Delete this chat? This action cannot be undone.')
      if (!confirmed) return

      setDeletingChatId(chatId)
      setLocalError(null)
      try {
        await deleteChat(chatId)
        if (activeChatId === chatId) {
          setComposerValue('')
        }
      } catch (error) {
        setLocalError(error instanceof Error ? error.message : 'Failed to delete chat')
      } finally {
        setDeletingChatId(null)
      }
    },
    [deleteChat, activeChatId]
  )

  const handleSendMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = composerValue.trim()
      if (!trimmed) return
      setLocalError(null)
      try {
        const payload = await sendMessage({
          chatId: activeChatId ?? undefined,
          customerId,
          message: trimmed,
        })
        setActiveChat(payload.chat.id)
        setComposerValue('')
      } catch (error) {
        setLocalError(error instanceof Error ? error.message : 'Failed to send message')
      }
    },
    [composerValue, sendMessage, activeChatId, customerId, setActiveChat]
  )

  const handleComposerChange = ({ value }: { value?: string }) => {
    setComposerValue(value ?? '')
  }

  const panelClasses = className ? `ai-agent-panel ${className}` : 'ai-agent-panel'
  const shouldShowEmptyState = chats.length === 0

  return (
    <Card padding={4} className={panelClasses}>
      <View direction="column" gap={4} attributes={{ style: { flex: 1, minHeight: 0 } }}>
        <View direction="row" justify="space-between" align="center">
          <View direction="column" gap={1}>
            <Text variant="title-6" weight="medium">
              AI Assistant
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              {customerName ? `Focused on ${customerName}` : 'Customer insights and next steps'}
            </Text>
          </View>
          <Button
            size="small"
            variant="outline"
            icon={<Plus weight="bold" />}
            loading={creating}
            onClick={handleCreateChat}
          >
            New Chat
          </Button>
        </View>

        {localError && (
          <Text variant="caption-1" color="critical">
            {localError}
          </Text>
        )}

        {chatsError && (
          <Text variant="caption-1" color="critical">
            {chatsError.message}
          </Text>
        )}

        <View className="ai-agent-panel__body" attributes={{ style: { flex: 1, minHeight: 0 } }}>
          <View className="ai-agent-panel__list">
            <Text variant="body-3" weight="medium">
              Chats
            </Text>
            <View className="ai-agent-panel__list-scroll">
              {chatsLoading && (
                <View align="center" justify="center" attributes={{ style: { padding: '24px 0' } }}>
                  <Loader />
                </View>
              )}

              {!chatsLoading && chats.length === 0 && (
                <View
                  direction="column"
                  gap={2}
                  align="center"
                  justify="center"
                  attributes={{ style: { padding: '32px 12px', textAlign: 'center' } }}
                >
                  <Text variant="body-2" color="neutral-faded">
                    No chats yet. Start a conversation to get tailored guidance.
                  </Text>
                </View>
              )}

              {chats.map((chat) => (
                <View
                  key={chat.id}
                  direction="column"
                  gap={1}
                  className={`ai-agent-panel__chat${chat.id === activeChatId ? ' is-active' : ''}`}
                  attributes={{
                    onClick: () => handleSelectChat(chat.id),
                    style: { cursor: 'pointer' },
                  }}
                >
                  <View direction="row" justify="space-between" align="center">
                    <Text variant="body-3" weight="medium" attributes={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                      {chat.title}
                    </Text>
                    <DropdownMenu position="bottom-end">
                      <DropdownMenu.Trigger>
                        {(attrs) => (
                          <Button
                            {...attrs}
                            variant="ghost"
                            icon={<Trash size={16} />}
                            size="small"
                            onClick={(event) => event.stopPropagation()}
                            loading={deletingChatId === chat.id}
                          />
                        )}
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteChat(chat.id)
                          }}
                        >
                          <View direction="row" gap={2} align="center">
                            <Icon svg={<Trash weight="bold" />} size={4} />
                            <Text>Delete chat</Text>
                          </View>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </View>
                  <Text variant="caption-1" color="neutral-faded">
                    {chat.messageCount > 0 ? `${chat.messageCount} messages` : 'No messages yet'}
                  </Text>
                  <Text variant="caption-1" color="neutral-faded">
                    Updated {formatRelativeTime(chat.lastMessageAt)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <div className="ai-agent-panel__divider" />

          <View className="ai-agent-panel__thread" gap={2}>
            {shouldShowEmptyState ? (
              <View className="ai-agent-panel__empty">
                <View direction="column" gap={2}>
                  <Text variant="body-2" color="neutral-faded">
                    Start a conversation with the AI assistant to get personalized coaching, action
                    plans, and call prep tips.
                  </Text>
                  <Button
                    variant="solid"
                    icon={<Plus weight="bold" />}
                    onClick={handleCreateChat}
                    loading={creating}
                  >
                    Start New Chat
                  </Button>
                </View>
              </View>
            ) : (
              <>
                <View className="ai-agent-panel__messages">
                  {messagesLoading && (
                    <View align="center" justify="center" attributes={{ style: { padding: '24px 0' } }}>
                      <Loader />
                    </View>
                  )}

                  {!messagesLoading && activeMessages.length === 0 && (
                    <View
                      direction="column"
                      gap={2}
                      align="center"
                      justify="center"
                      attributes={{ style: { padding: '32px 12px', textAlign: 'center' } }}
                    >
                      <Text variant="body-2" color="neutral-faded">
                        Ask a question to kick off this chat.
                      </Text>
                    </View>
                  )}

                  {!messagesLoading &&
                    activeMessages.map((message) => (
                      <View
                        key={message.id}
                        className={`ai-agent-panel__message ${
                          message.role === 'user'
                            ? 'ai-agent-panel__message--user'
                            : 'ai-agent-panel__message--assistant'
                        }`}
                      >
                        <Text variant="body-3">{message.content}</Text>
                        <span className="ai-agent-panel__message-metadata">
                          {message.role === 'user' ? 'You' : 'Assistant'} •{' '}
                          {formatRelativeTime(message.createdAt)}
                        </span>
                      </View>
                    ))}
                </View>

                <form className="ai-agent-panel__composer" onSubmit={handleSendMessage}>
                  <View direction="column" gap={2}>
                    <TextArea
                      name="ai-assistant-input"
                      placeholder="Ask a question about this customer..."
                      value={composerValue}
                      onChange={handleComposerChange}
                      disabled={sendingMessage}
                      inputAttributes={{
                        rows: 2,
                        style: { resize: 'vertical' },
                      }}
                    />
                    <View direction="row" justify="space-between" align="center">
                      <Text variant="caption-1" color="neutral-faded">
                        Responses use the latest customer context.
                      </Text>
                      <Button
                        type="submit"
                        variant="solid"
                        icon={<PaperPlaneTilt weight="bold" />}
                        disabled={sendingMessage || !composerValue.trim()}
                        loading={sendingMessage}
                      >
                        Send
                      </Button>
                    </View>
                  </View>
                </form>
              </>
            )}
          </View>
        </View>
      </View>
    </Card>
  )
}

