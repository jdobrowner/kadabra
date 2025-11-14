import { Card, Text, View, Select, Button, ToggleButtonGroup, ToggleButton, Icon } from 'reshaped'
import { Funnel, X, TrendUp, Clock } from '@phosphor-icons/react'

export interface FilterBoxProps {
  priorityFilter?: string
  assigneeFilter?: string
  timeframeFilter?: string
  rankingOption?: 'priority' | 'most-recent'
  onPriorityChange?: (value: string) => void
  onAssigneeChange?: (value: string) => void
  onTimeframeChange?: (value: string) => void
  onRankingChange?: (value: 'priority' | 'most-recent') => void
  onClear?: () => void
}

export function FilterBox({
  priorityFilter = 'all',
  assigneeFilter = 'all',
  timeframeFilter = 'all',
  rankingOption = 'priority',
  onPriorityChange,
  onAssigneeChange,
  onTimeframeChange,
  onRankingChange,
  onClear
}: FilterBoxProps) {
  const hasActiveFilters = priorityFilter !== 'all' || assigneeFilter !== 'all' || timeframeFilter !== 'all'
  const normalizeToggleValue = (value: unknown, fallback: string) => {
    if (Array.isArray(value)) {
      const first = value[0]
      return typeof first === 'string' ? first : fallback
    }
    if (typeof value === 'string') {
      return value
    }
    return fallback
  }
  const getToggleButtonAttributes = (isActive: boolean) => ({
    style: {
      borderRadius: '30px',
      border: '1px solid',
      borderColor: isActive ? 'var(--rs-color-border-primary)' : 'var(--rs-color-border-neutral-faded)',
      backgroundColor: isActive ? 'var(--rs-color-background-primary-faded)' : 'transparent',
      color: isActive ? 'var(--rs-color-foreground-primary)' : undefined,
      boxShadow: isActive ? '0 1px 2px rgba(16, 24, 40, 0.08)' : 'none',
      fontWeight: isActive ? 600 : undefined,
      transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    },
  })

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        {/* Filters Row */}
        <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
          <View direction="row" gap={2} align="center">
            <Funnel size={18} weight="bold" />
            <Text variant="body-2" weight="medium">
              Filters:
            </Text>
          </View>

          <ToggleButtonGroup
            value={priorityFilter ? [priorityFilter] : []}
            onChange={({ value }) => {
              const normalized = normalizeToggleValue(value, 'all')
              onPriorityChange?.(normalized || 'all')
            }}
            selectionMode="single"
          >
            <ToggleButton value="all" attributes={getToggleButtonAttributes(priorityFilter === 'all')}>
              All Priority
            </ToggleButton>
            <ToggleButton value="at-risk" attributes={getToggleButtonAttributes(priorityFilter === 'at-risk')}>
              At-Risk
            </ToggleButton>
            <ToggleButton
              value="opportunity"
              attributes={getToggleButtonAttributes(priorityFilter === 'opportunity')}
            >
              Opportunity
            </ToggleButton>
            <ToggleButton value="lead" attributes={getToggleButtonAttributes(priorityFilter === 'lead')}>
              Lead
            </ToggleButton>
            <ToggleButton
              value="follow-up"
              attributes={getToggleButtonAttributes(priorityFilter === 'follow-up')}
            >
              Follow-Up
            </ToggleButton>
            <ToggleButton value="no-action" attributes={getToggleButtonAttributes(priorityFilter === 'no-action')}>
              No Action
            </ToggleButton>
          </ToggleButtonGroup>

          <Select
            name="assignee"
            value={assigneeFilter}
            onChange={(value) => onAssigneeChange?.(typeof value === 'string' ? value : value?.value || '')}
            options={[
              { value: 'all', label: 'All Assignees' },
              { value: 'john-smith', label: 'John Smith' },
              { value: 'emily-davis', label: 'Emily Davis' },
              { value: 'michael-chen', label: 'Michael Chen' },
              { value: 'unassigned', label: 'Unassigned' },
            ]}
            attributes={{ style: { minWidth: '150px' } }}
          />

          <Select
            name="timeframe"
            value={timeframeFilter}
            onChange={(value) => onTimeframeChange?.(typeof value === 'string' ? value : value?.value || '')}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
            attributes={{ style: { minWidth: '150px' } }}
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="small"
              icon={<X />}
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </View>

        {/* Ranking Row */}
        <View direction="row" gap={4} align="center" attributes={{ style: { justifyContent: 'space-between' } }}>
          <View direction="row" gap={2} align="center">
            <Icon svg={<TrendUp weight="bold" />} size={4} />
            <Text variant="body-2" weight="medium">
              Ranked by:
            </Text>
            <ToggleButtonGroup
              value={rankingOption ? [rankingOption] : []}
              onChange={({ value }) => {
                const normalized = normalizeToggleValue(value, 'priority') as 'priority' | 'most-recent'
                onRankingChange?.(normalized)
              }}
              selectionMode="single"
            >
              <ToggleButton
                value="priority"
                attributes={getToggleButtonAttributes(rankingOption === 'priority')}
              >
                <View direction="row" gap={2} align="center">
                  <Icon svg={<TrendUp />} size={4} />
                  <Text>Priority</Text>
                </View>
              </ToggleButton>
              <ToggleButton
                value="most-recent"
                attributes={getToggleButtonAttributes(rankingOption === 'most-recent')}
              >
                <View direction="row" gap={2} align="center">
                  <Icon svg={<Clock />} size={4} />
                  <Text>Most Recent</Text>
                </View>
              </ToggleButton>
            </ToggleButtonGroup>
          </View>
        </View>
      </View>
    </Card>
  )
}
