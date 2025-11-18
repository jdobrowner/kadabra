import { Card, Text, View, Icon } from 'reshaped'
import { Lightning, Clock, Envelope, Phone, ListChecks, ChatCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { ActNowButton } from './ActNowButton'
import { formatRelativeTime } from '../../utils/formatTime'

export interface ActionPlanCardProps {
  actionPlanId?: string
  customerId?: string
  hasActionPlan: boolean
  status?: 'active' | 'completed'
  aiRecommendation?: string
  actionItems?: Array<{
    id: string
    type: string
    title: string
    description: string
    status: string
  }>
  createdAt?: string
}

export function ActionPlanCard({
  actionPlanId,
  customerId,
  hasActionPlan,
  status: _status, // eslint-disable-line @typescript-eslint/no-unused-vars
  aiRecommendation,
  actionItems = [],
  createdAt
}: ActionPlanCardProps) {
  const navigate = useNavigate()

  if (!hasActionPlan) {
    return (
      <Card padding={6}>
        <View direction="column" gap={3} align="center">
          <Icon svg={<Lightning weight="bold" />} size={8} />
          <Text variant="body-2" color="neutral-faded">
            No action plan
          </Text>
        </View>
      </Card>
    )
  }

  const handleActNow = () => {
    if (actionPlanId && customerId) {
      navigate(`/triage/customers/${customerId}/action-plans/${actionPlanId}`)
    } else if (customerId) {
      navigate(`/triage/customers/${customerId}`)
    }
  }

  // Get icon for action item type
  const getActionItemIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Envelope
      case 'call':
        return Phone
      case 'task':
        return ListChecks
      case 'text':
        return ChatCircle
      default:
        return ListChecks
    }
  }

  // Group action items by type for display
  const actionItemsByType = actionItems.reduce((acc, item) => {
    const type = item.type || 'task'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(item)
    return acc
  }, {} as Record<string, typeof actionItems>)

  return (
    <Card padding={6}>
      {/* Grid layout: left column for content, right column for button */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
        {/* Left column: Content */}
        <View direction="column" gap={4}>
          <View direction="column" gap={2}>
            <View direction="row" gap={2} align="center">
              <Icon svg={<Lightning weight="bold" />} size={5} />
              <h3 style={{ margin: 0 }}>Action Plan</h3>
            </View>
            {aiRecommendation && (
              <Text variant="body-2" color="neutral-faded">
                {aiRecommendation}
              </Text>
            )}
          </View>

          {/* Action items list with icons and created date */}
          {(actionItems.length > 0 || createdAt) && (
            <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              {/* Action items with icons */}
              {actionItems.length > 0 && (
                <>
                  {Object.entries(actionItemsByType).map(([type, items], typeIndex) => {
                    const IconComponent = getActionItemIcon(type)
                    const typeLabel = type === 'email' ? (items.length === 1 ? 'Email' : 'Emails') :
                                     type === 'call' ? (items.length === 1 ? 'Call' : 'Calls') :
                                     type === 'task' ? (items.length === 1 ? 'Task' : 'Tasks') :
                                     type === 'text' ? (items.length === 1 ? 'Text' : 'Texts') :
                                     (items.length === 1 ? 'Item' : 'Items')
                    return (
                      <View key={type} direction="row" gap={1} align="center">
                        <Icon 
                          svg={<IconComponent weight="bold" />}
                          attributes={{ 
                            style: { color: 'var(--rs-color-foreground-neutral-faded)' } 
                          }} 
                        />
                        <Text variant="body-2" color="neutral-faded">
                          {items.length} {typeLabel}
                        </Text>
                        {(typeIndex < Object.keys(actionItemsByType).length - 1 || createdAt) && (
                          <Text variant="body-2" color="neutral-faded">•</Text>
                        )}
                      </View>
                    )
                  })}
                </>
              )}
              {/* Created date */}
              {createdAt && (
                <View direction="row" gap={1} align="center">
                  <Icon svg={<Clock />} size={4} attributes={{ 
                            style: { color: 'var(--rs-color-foreground-neutral-faded)' } 
                          }}  />
                  <Text variant="body-2" color="neutral-faded">
                    Created {formatRelativeTime(createdAt)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Right column: Act Now button */}
        <View attributes={{ style: { display: 'flex', alignItems: 'center' } }}>
          <ActNowButton 
            onClick={handleActNow}
            disabled={!actionPlanId || !customerId}
          />
        </View>
      </div>
    </Card>
  )
}
