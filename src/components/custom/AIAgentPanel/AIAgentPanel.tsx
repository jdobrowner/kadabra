import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { View, Text, Button, Icon, Loader, TextArea, Divider } from 'reshaped'
import { Plus, PaperPlaneTilt, X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useAiAgentStore } from '../../../store/useAIAgentStore'
import { formatRelativeTime } from '../../../utils/formatTime'
import './AIAgentPanel.css'

interface AIAgentPanelProps {
  customerId: string
  customerName?: string
  className?: string
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function AIAgentPanel({ customerId, customerName, className, onCollapseChange }: AIAgentPanelProps) {
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('ai-agent-panel-collapsed')
    return saved === 'true' ? true : false
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

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

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages, sendingMessage])

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

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    localStorage.setItem('ai-agent-panel-collapsed', String(newCollapsed))
    onCollapseChange?.(newCollapsed)
  }, [isCollapsed, onCollapseChange])

  const panelClasses = className ? `ai-agent-panel ${className}` : 'ai-agent-panel'
  const shouldShowEmptyState = chats.length === 0

  return (
    <>
      <View direction="row" justify="space-between" align="center" className="ai-agent-panel__header">
        {!isCollapsed && (
          <>
            <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
              <View direction="row" align="center" gap={3}>
                <Button
                  variant="ghost"
                  size="small"
                  icon={<CaretLeft weight="bold" />}
                  onClick={handleToggleCollapse}
                  attributes={{ style: { flexShrink: 0 } }}
                />
                <Text variant="body-3" weight="medium">
                  AI Assistant
                </Text>
              </View>
              <Text variant="caption-1" color="neutral-faded">
                {customerName ? `Focused on ${customerName}` : 'Customer insights and next steps'}
              </Text>
            </View>
          </>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="small"
            icon={<CaretRight weight="bold" />}
            onClick={handleToggleCollapse}
            attributes={{ style: { flexShrink: 0 } }}
          />
        )}
      </View>

      {!isCollapsed && (
        <View className={panelClasses} direction="column" gap={4} attributes={{ style: { flex: 1, minHeight: 0 } }}>
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
              <Divider />
              <View direction="row" align="center" justify="space-between" gap={2}>
                <Text variant="body-3" weight="medium">
                  Chats
                </Text>
                <Button
                  variant="ghost"
                  size="small"
                  icon={<Plus weight="bold" />}
                  loading={creating}
                  onClick={handleCreateChat}
                  attributes={{ style: { flexShrink: 0 } }}
                />
              </View>
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
                  direction="row"
                  align="center"
                  justify="space-between"
                  gap={2}
                  className={`ai-agent-panel__chat${chat.id === activeChatId ? ' is-active' : ''}`}
                  attributes={{
                    onClick: () => handleSelectChat(chat.id),
                    style: { cursor: 'pointer' },
                  }}
                >
                  <Text 
                    variant="caption-1" 
                    weight="medium"
                    color={chat.id === activeChatId ? "neutral" : undefined}
                    attributes={{ 
                      style: { 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        lineHeight: '16px'
                      } 
                    }}
                  >
                    {chat.title}
                  </Text>
                  <Button
                    variant="ghost"
                    icon={<X size={10} weight="bold" />}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDeleteChat(chat.id)
                    }}
                    loading={deletingChatId === chat.id}
                    attributes={{
                      style: { flexShrink: 0, padding: '1px', minWidth: '20px', height: '20px' }
                    }}
                  />
                </View>
              ))}
              </View>
            </View>

            <Divider />

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
                  <div ref={messagesEndRef} />
                </View>

                <form className="ai-agent-panel__composer" onSubmit={handleSendMessage}>
                  <View className="ai-agent-panel__composer-wrapper">
                    <TextArea
                      name="ai-assistant-input"
                      placeholder="Ask a question about this customer..."
                      value={composerValue}
                      onChange={handleComposerChange}
                      disabled={sendingMessage}
                      inputAttributes={{
                        rows: Math.min(Math.max(composerValue.split('\n').length, 4), 10),
                        style: { 
                          resize: 'none', 
                          paddingRight: '48px',
                          overflow: 'hidden'
                        },
                      }}
                      className="ai-agent-panel__textarea"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      icon={<PaperPlaneTilt weight="bold" />}
                      disabled={sendingMessage || !composerValue.trim()}
                      loading={sendingMessage}
                      className="ai-agent-panel__send-button"
                    />
                  </View>
                </form>
              </>
            )}
            </View>
          </View>
        </View>
      )}
    </>
  )
}

