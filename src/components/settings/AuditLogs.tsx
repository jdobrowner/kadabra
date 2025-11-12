import { View, Text, Icon } from 'reshaped'
import { Clock, User, CheckCircle, FileText, UserPlus, UserMinus } from '@phosphor-icons/react'
import { trpc } from '../../lib/trpc-client'

interface AuditLogsProps {
  actionPlanId: string
}

export default function AuditLogs({ actionPlanId }: AuditLogsProps) {
  const { data: logs, isLoading, error } = trpc.actionPlans.getAuditLogs.useQuery({
    actionPlanId,
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'status_change':
        return <CheckCircle weight="bold" />
      case 'record_created':
        return <FileText weight="bold" />
      case 'assigned':
        return <UserPlus weight="bold" />
      case 'unassigned':
        return <UserMinus weight="bold" />
      default:
        return <Clock weight="bold" />
    }
  }

  const getActionLabel = (action: string, previousStatus?: string | null, newStatus?: string | null) => {
    switch (action) {
      case 'status_change':
        return `Status changed from ${previousStatus || 'N/A'} to ${newStatus || 'N/A'}`
      case 'record_created':
        return 'Record created'
      case 'assigned':
        return 'Assigned to user'
      case 'unassigned':
        return 'Unassigned from user'
      case 'updated':
        return 'Updated'
      default:
        return action
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <View direction="column" gap={2}>
        <Text variant="caption-1" color="neutral-faded">
          Loading audit log...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View direction="column" gap={2}>
        <Text variant="caption-1" color="critical">
          Error loading audit log: {error.message}
        </Text>
      </View>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <View
        direction="column"
        gap={2}
        align="center"
        padding={4}
        attributes={{
          style: {
            border: '1px dashed var(--rs-color-border-neutral)',
            borderRadius: '8px',
          },
        }}
      >
        <Icon svg={<Clock weight="regular" />} size={6} color="neutral-faded" />
        <Text variant="caption-1" color="neutral-faded" align="center">
          No audit log entries yet
        </Text>
      </View>
    )
  }

  return (
    <View direction="column" gap={3}>
      <Text variant="body-2" weight="medium">
        Activity History
      </Text>
      <View direction="column" gap={2}>
        {logs.map((log) => (
          <View
            key={log.id}
            direction="row"
            gap={3}
            padding={3}
            attributes={{
              style: {
                border: '1px solid var(--rs-color-border-neutral)',
                borderRadius: '6px',
                backgroundColor: 'var(--rs-color-background-neutral)',
              },
            }}
          >
            <View
              attributes={{
                style: {
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--rs-color-primary-background)',
                },
              }}
            >
              <Icon svg={getActionIcon(log.action)} size={5} color="primary" />
            </View>
            <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium">
                  {getActionLabel(log.action, log.previousStatus, log.newStatus)}
                </Text>
                {log.recordType && log.recordId && (
                  <View
                    attributes={{
                      style: {
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--rs-color-primary-background)',
                        fontSize: '11px',
                      },
                    }}
                  >
                    {log.recordType} #{log.recordId}
                  </View>
                )}
              </View>
              
              {log.recordUrl && (
                <Text variant="caption-1">
                  <a
                    href={log.recordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--rs-color-primary)' }}
                  >
                    View Record →
                  </a>
                </Text>
              )}
              
              <View direction="row" gap={2} align="center">
                {log.user ? (
                  <View direction="row" gap={1} align="center">
                    <Icon svg={<User weight="regular" />} size={3} color="neutral-faded" />
                    <Text variant="caption-1" color="neutral-faded">
                      {log.user.name}
                    </Text>
                  </View>
                ) : (
                  <Text variant="caption-1" color="neutral-faded">
                    System
                  </Text>
                )}
                <Text variant="caption-1" color="neutral-faded">
                  •
                </Text>
                <View direction="row" gap={1} align="center">
                  <Icon svg={<Clock weight="regular" />} size={3} color="neutral-faded" />
                  <Text variant="caption-1" color="neutral-faded">
                    {formatDate(log.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

