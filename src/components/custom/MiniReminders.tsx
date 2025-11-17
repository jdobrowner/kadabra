import { Text, View, Card, Icon } from 'reshaped'
import { RowCard } from './RowCard'
import { Bell, Envelope, Phone, ChatCircle, CheckSquare } from '@phosphor-icons/react'
import { useRemindersStore } from '../../store/useRemindersStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Reminder } from '../../store/useRemindersStore'

export interface MiniRemindersProps {
  onReminderClick?: (reminderId: string) => void
}

function getReminderTypeIcon(type: Reminder['type']) {
  switch (type) {
    case 'email':
      return Envelope
    case 'call':
      return Phone
    case 'text':
      return ChatCircle
    case 'task':
      return CheckSquare
    default:
      return Bell
  }
}

function formatRelativeTime(reminderDate: string): string {
  const now = new Date()
  const date = new Date(reminderDate)
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Overdue'
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 7) {
    return `In ${diffDays} days`
  } else if (diffDays < 14) {
    return 'In 1 week'
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`
  } else if (diffDays < 60) {
    return 'In 1 month'
  } else {
    const months = Math.floor(diffDays / 30)
    return `In ${months} month${months > 1 ? 's' : ''}`
  }
}

export function MiniReminders({ onReminderClick }: MiniRemindersProps) {
  const upcomingReminders = useRemindersStore((state) => state.upcomingReminders)
  const fetchUpcomingReminders = useRemindersStore((state) => state.fetchUpcomingReminders)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUpcomingReminders()
  }, [fetchUpcomingReminders])

  const handleClick = (reminderId: string) => {
    if (onReminderClick) {
      onReminderClick(reminderId)
    } else {
      navigate('/reminders')
    }
  }

  // Get top 5 upcoming reminders
  const displayReminders = upcomingReminders.slice(0, 5)

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        <View direction="row" gap={2} align="center">
          <Bell size={20} weight="bold" />
          <Text variant="title-4" weight="bold">
            Upcoming Reminders
          </Text>
        </View>

        {displayReminders.length === 0 ? (
          <Text variant="body-2" color="neutral-faded">
            No upcoming reminders
          </Text>
        ) : (
          <View direction="column" gap={0}>
            {displayReminders.map((reminder, index) => {
              const IconComponent = getReminderTypeIcon(reminder.type)
              return (
                <RowCard
                  key={reminder.id}
                  padding={4}
                  noBorderBottom={index === displayReminders.length - 1}
                  onClick={() => handleClick(reminder.id)}
                >
                  <View direction="row" gap={3} align="center" attributes={{ style: { width: '100%' } }}>
                    <Icon svg={<IconComponent size={18} weight="bold" />} size={5} />
                    <View direction="column" gap={1} attributes={{ style: { flex: 1, minWidth: 0 } }}>
                      <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
                        <Text variant="body-2" weight="medium" attributes={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                          {reminder.title}
                        </Text>
                        <Text variant="caption-1" color="neutral-faded">
                          {formatRelativeTime(reminder.reminderDate)}
                        </Text>
                      </View>
                      {reminder.description && (
                        <Text variant="body-3" color="neutral-faded" attributes={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                          {reminder.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </RowCard>
              )
            })}
          </View>
        )}
      </View>
    </Card>
  )
}

