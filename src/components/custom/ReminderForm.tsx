import { useState, useEffect } from 'react'
import { Modal, View, Text, Button, TextField, TextArea } from 'reshaped'
import { useRemindersStore, type Reminder } from '../../store/useRemindersStore'
import { useCustomersStore } from '../../store/useCustomersStore'
import { StyledDropdown } from './StyledDropdown'
import { Envelope, Phone, ChatCircle, CheckSquare } from '@phosphor-icons/react'

export interface ReminderFormProps {
  reminder?: Reminder
  actionItemId?: string
  customerId?: string
  onClose: () => void
  onSuccess?: () => void
}

const RELATIVE_TIME_OPTIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
]

function calculateReminderDate(relativeTimeDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + relativeTimeDays)
  return date.toISOString()
}

function formatDatePreview(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function ReminderForm({ reminder, actionItemId, customerId: initialCustomerId, onClose, onSuccess }: ReminderFormProps) {
  const createReminder = useRemindersStore((state) => state.createReminder)
  const updateReminder = useRemindersStore((state) => state.updateReminder)
  const createReminderFromActionItem = useRemindersStore((state) => state.createReminderFromActionItem)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const customers = useCustomersStore((state) => state.customers)

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || reminder?.customerId || '')
  const [type, setType] = useState<Reminder['type']>(reminder?.type || 'call')
  const [title, setTitle] = useState<string>(reminder?.title || '')
  const [description, setDescription] = useState<string>(reminder?.description || '')
  const [relativeTimeDays, setRelativeTimeDays] = useState<number>(
    reminder ? Math.ceil((new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 14
  )
  const [customDays, setCustomDays] = useState<string>('')
  const [useCustomDays, setUseCustomDays] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCustomers({})
  }, [fetchCustomers])

  const reminderDate = useCustomDays && customDays
    ? calculateReminderDate(parseInt(customDays) || 0)
    : calculateReminderDate(relativeTimeDays)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomerId || !title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const reminderDateValue = useCustomDays && customDays
        ? calculateReminderDate(parseInt(customDays) || 0)
        : calculateReminderDate(relativeTimeDays)

      if (actionItemId && !reminder) {
        // Create from action item
        await createReminderFromActionItem(actionItemId, {
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          reminderDate: reminderDateValue,
        })
      } else if (reminder) {
        // Update existing reminder
        await updateReminder(reminder.id, {
          type,
          title: title.trim(),
          description: description.trim() || null,
          reminderDate: reminderDateValue,
        })
      } else {
        // Create new reminder
        await createReminder({
          customerId: selectedCustomerId,
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          reminderDate: reminderDateValue,
        })
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save reminder:', error)
      alert('Failed to save reminder. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  return (
    <Modal active={true} onClose={onClose}>
      <Modal.Title>
        {reminder ? 'Edit Reminder' : actionItemId ? 'Create Reminder from Action Item' : 'Create Reminder'}
      </Modal.Title>

      <form onSubmit={handleSubmit}>
        <View direction="column" gap={4} padding={4}>
          {/* Customer Selection */}
          {!actionItemId && !initialCustomerId && (
            <View direction="column" gap={2}>
              <Text variant="caption-1" weight="medium">
                Customer
              </Text>
              <StyledDropdown
                trigger={
                  <Text>
                    {selectedCustomer ? `${selectedCustomer.name}${selectedCustomer.companyName ? ` - ${selectedCustomer.companyName}` : ''}` : 'Select customer'}
                  </Text>
                }
                fullWidth
              >
                {customers.map((customer) => (
                  <StyledDropdown.Item key={customer.id} onClick={() => setSelectedCustomerId(customer.id)}>
                    {customer.name}{customer.companyName ? ` - ${customer.companyName}` : ''}
                  </StyledDropdown.Item>
                ))}
              </StyledDropdown>
            </View>
          )}

          {/* Type Selection */}
          <View direction="column" gap={2}>
            <Text variant="caption-1" weight="medium">
              Type
            </Text>
            <View direction="row" gap={2} attributes={{ style: { flexWrap: 'wrap' } }}>
              {(['email', 'call', 'text', 'task'] as const).map((reminderType) => {
                const icons = {
                  email: Envelope,
                  call: Phone,
                  text: ChatCircle,
                  task: CheckSquare,
                }
                const IconComponent = icons[reminderType]
                return (
                  <Button
                    key={reminderType}
                    variant={type === reminderType ? 'solid' : 'outline'}
                    color={type === reminderType ? 'primary' : undefined}
                    onClick={() => setType(reminderType)}
                    attributes={{ type: 'button' }}
                  >
                    <View direction="row" gap={2} align="center">
                      <IconComponent size={18} weight="bold" />
                      <Text>{reminderType.charAt(0).toUpperCase() + reminderType.slice(1)}</Text>
                    </View>
                  </Button>
                )
              })}
            </View>
          </View>

          {/* Title */}
          <View direction="column" gap={2}>
            <Text variant="caption-1" weight="medium">
              Title *
            </Text>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Call customer about billing"
              required
            />
          </View>

          {/* Description */}
          <View direction="column" gap={2}>
            <Text variant="caption-1" weight="medium">
              Description
            </Text>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this reminder"
              rows={3}
            />
          </View>

          {/* Relative Time */}
          <View direction="column" gap={2}>
            <Text variant="caption-1" weight="medium">
              Remind me in
            </Text>
            {!useCustomDays ? (
              <StyledDropdown
                trigger={
                  <Text>
                    {RELATIVE_TIME_OPTIONS.find(opt => opt.days === relativeTimeDays)?.label || `${relativeTimeDays} days`}
                  </Text>
                }
                fullWidth
              >
                {RELATIVE_TIME_OPTIONS.map((option) => (
                  <StyledDropdown.Item key={option.days} onClick={() => setRelativeTimeDays(option.days)}>
                    {option.label}
                  </StyledDropdown.Item>
                ))}
                <StyledDropdown.Item onClick={() => setUseCustomDays(true)}>
                  Custom...
                </StyledDropdown.Item>
              </StyledDropdown>
            ) : (
              <View direction="row" gap={2} align="center">
                <TextField
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Days"
                  attributes={{ style: { flex: 1 } }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setUseCustomDays(false)
                    setCustomDays('')
                  }}
                  attributes={{ type: 'button' }}
                >
                  Cancel
                </Button>
              </View>
            )}
          </View>

          {/* Date Preview */}
          <View
            direction="column"
            gap={1}
            padding={3}
            attributes={{
              style: {
                backgroundColor: 'var(--rs-color-background-neutral-stronger)',
                borderRadius: '8px',
              },
            }}
          >
            <Text variant="caption-1" color="neutral-faded">
              Reminder will trigger on:
            </Text>
            <Text variant="body-2" weight="medium">
              {formatDatePreview(reminderDate)}
            </Text>
          </View>

          {/* Actions */}
          <View direction="row" gap={2} justify="end">
            <Button variant="outline" onClick={onClose} attributes={{ type: 'button' }}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              type="submit"
              disabled={isSubmitting || !selectedCustomerId || !title.trim()}
            >
              {reminder ? 'Update' : 'Create'} Reminder
            </Button>
          </View>
        </View>
      </form>
    </Modal>
  )
}

