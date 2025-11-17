import { Container, View, Card, Text, Button, Icon, Badge } from 'reshaped'
import { PageHeader } from '../components/custom/PageHeader'
import { RowCard } from '../components/custom/RowCard'
import { useRemindersStore, type Reminder } from '../store/useRemindersStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useEffect, useState } from 'react'
import { Alarm, Envelope, Phone, ChatCircle, CheckSquare, Plus, Check, X, Pencil, Trash } from '@phosphor-icons/react'
import { StyledDropdown } from '../components/custom/StyledDropdown'
import { ReminderForm } from '../components/custom/ReminderForm'
import { AvatarWithInitials } from '../components/custom/AvatarWithInitials'

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
      return Alarm
  }
}

function getStatusColor(status: Reminder['status']): 'positive' | 'critical' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'positive'
    case 'dismissed':
      return 'neutral'
    case 'pending':
      return 'neutral'
    default:
      return 'neutral'
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

function formatDate(reminderDate: string): string {
  const date = new Date(reminderDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RemindersView() {
  const reminders = useRemindersStore((state) => state.reminders)
  const fetchReminders = useRemindersStore((state) => state.fetchReminders)
  const updateReminder = useRemindersStore((state) => state.updateReminder)
  const deleteReminder = useRemindersStore((state) => state.deleteReminder)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const customers = useCustomersStore((state) => state.customers)

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'dismissed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'call' | 'text' | 'task'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  useEffect(() => {
    fetchReminders({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    })
    fetchCustomers({})
  }, [statusFilter, fetchReminders, fetchCustomers])

  const filteredReminders = reminders.filter((reminder) => {
    if (typeFilter !== 'all' && reminder.type !== typeFilter) return false
    if (customerFilter !== 'all' && reminder.customerId !== customerFilter) return false
    return true
  })

  const handleComplete = async (id: string) => {
    await updateReminder(id, { status: 'completed' })
  }

  const handleDismiss = async (id: string) => {
    await updateReminder(id, { status: 'dismissed' })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id)
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setShowCreateForm(true)
  }

  const handleCreate = () => {
    setEditingReminder(null)
    setShowCreateForm(true)
  }

  const handleFormClose = () => {
    setShowCreateForm(false)
    setEditingReminder(null)
  }

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || customerFilter !== 'all'

  return (
    <Container>
      <View direction="column" gap={6}>
        <PageHeader
          title="Reminders"
          subtitle="Manage your reminders and follow-ups"
        />

        {/* Filters and Create Button */}
        <Card padding={6}>
          <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap', justifyContent: 'space-between' } }}>
            <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              <View direction="row" gap={2} align="center">
                <Alarm size={18} weight="bold" />
                <Text variant="body-2" attributes={{ style: { fontWeight: '500' } }}>Filter by:</Text>
              </View>

              {/* Status Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium" color="neutral-faded">Status:</Text>
                <StyledDropdown
                  trigger={
                    <Text>
                      {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </Text>
                  }
                >
                  <StyledDropdown.Item onClick={() => setStatusFilter('all')}>All Status</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setStatusFilter('pending')}>Pending</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setStatusFilter('completed')}>Completed</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setStatusFilter('dismissed')}>Dismissed</StyledDropdown.Item>
                </StyledDropdown>
              </View>

              {/* Type Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium" color="neutral-faded">Type:</Text>
                <StyledDropdown
                  trigger={
                    <Text>
                      {typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                    </Text>
                  }
                >
                  <StyledDropdown.Item onClick={() => setTypeFilter('all')}>All Types</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setTypeFilter('email')}>Email</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setTypeFilter('call')}>Call</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setTypeFilter('text')}>Text</StyledDropdown.Item>
                  <StyledDropdown.Item onClick={() => setTypeFilter('task')}>Task</StyledDropdown.Item>
                </StyledDropdown>
              </View>

              {/* Customer Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium" color="neutral-faded">Customer:</Text>
                <StyledDropdown
                  trigger={
                    <Text>
                      {customerFilter === 'all' ? 'All Customers' : customers.find(c => c.id === customerFilter)?.name || 'Unknown'}
                    </Text>
                  }
                >
                  <StyledDropdown.Item onClick={() => setCustomerFilter('all')}>All Customers</StyledDropdown.Item>
                  {customers.map((customer) => (
                    <StyledDropdown.Item key={customer.id} onClick={() => setCustomerFilter(customer.id)}>
                      {customer.name}
                    </StyledDropdown.Item>
                  ))}
                </StyledDropdown>
              </View>

              {hasActiveFilters && (
                <Button variant="outline" size="small" onClick={() => {
                  setStatusFilter('all')
                  setTypeFilter('all')
                  setCustomerFilter('all')
                }}>
                  Clear Filters
                </Button>
              )}
            </View>

            <Button variant="solid" color="primary" size="small" icon={<Plus weight="bold" />} onClick={handleCreate}>
              Create Reminder
            </Button>
          </View>
        </Card>

        {/* Reminders List */}
        {filteredReminders.length === 0 ? (
          <Card padding={8}>
            <View direction="column" gap={2} align="center">
              <Text variant="body-2" color="neutral-faded">
                {reminders.length === 0 ? 'No reminders yet' : 'No reminders match your filters'}
              </Text>
            </View>
          </Card>
        ) : (
          <Card padding={0}>
            <View direction="column" gap={0}>
              {filteredReminders.map((reminder, index) => {
                const IconComponent = getReminderTypeIcon(reminder.type)
                const customer = customers.find(c => c.id === reminder.customerId)
                const isOverdue = new Date(reminder.reminderDate) < new Date() && reminder.status === 'pending'

                return (
                  <RowCard
                    key={reminder.id}
                    padding={6}
                    noBorderBottom={index === filteredReminders.length - 1}
                  >
                    <View direction="row" gap={4} align="center" attributes={{ style: { width: '100%' } }}>
                      {/* Icon */}
                      <Icon svg={<IconComponent size={20} weight="bold" />} size={6} />

                      {/* Customer Info */}
                      {customer && (
                        <AvatarWithInitials src={customer.avatar} alt={customer.name} name={customer.name} size={10} />
                      )}

                      {/* Content */}
                      <View direction="column" gap={2} attributes={{ style: { flex: 1, minWidth: 0 } }}>
                        <View direction="row" gap={2} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
                          <Text variant="body-2" weight="medium">
                            {reminder.title}
                          </Text>
                          {customer && (
                            <Text variant="body-3" color="neutral-faded">
                              {customer.name}
                            </Text>
                          )}
                          <Badge color={getStatusColor(reminder.status)} size="small">
                            {reminder.status}
                          </Badge>
                          {isOverdue && (
                            <Badge color="critical" size="small">
                              Overdue
                            </Badge>
                          )}
                        </View>
                        {reminder.description && (
                          <Text variant="body-3" color="neutral-faded">
                            {reminder.description}
                          </Text>
                        )}
                        <View direction="row" gap={2} align="center">
                          <Text variant="caption-1" color="neutral-faded">
                            {formatRelativeTime(reminder.reminderDate)} • {formatDate(reminder.reminderDate)}
                          </Text>
                        </View>
                      </View>

                      {/* Actions */}
                      {reminder.status === 'pending' && (
                        <View direction="row" gap={2} align="center">
                          <Button
                            variant="ghost"
                            size="small"
                            icon={<Check weight="bold" />}
                            onClick={() => handleComplete(reminder.id)}
                            attributes={{ 'aria-label': 'Complete reminder' }}
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={<X weight="bold" />}
                            onClick={() => handleDismiss(reminder.id)}
                            attributes={{ 'aria-label': 'Dismiss reminder' }}
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={<Pencil weight="bold" />}
                            onClick={() => handleEdit(reminder)}
                            attributes={{ 'aria-label': 'Edit reminder' }}
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={<Trash weight="bold" />}
                            onClick={() => handleDelete(reminder.id)}
                            attributes={{ 'aria-label': 'Delete reminder' }}
                          />
                        </View>
                      )}
                    </View>
                  </RowCard>
                )
              })}
            </View>
          </Card>
        )}

        {/* Reminder Form Modal */}
        {showCreateForm && (
          <ReminderForm
            reminder={editingReminder || undefined}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormClose()
              fetchReminders({
                status: statusFilter !== 'all' ? statusFilter : undefined,
              })
            }}
          />
        )}
      </View>
    </Container>
  )
}

