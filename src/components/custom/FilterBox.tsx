import { Card, Text, View, Button, Icon } from 'reshaped'
import { Funnel, X, ArrowsDownUp } from '@phosphor-icons/react'
import { StyledDropdown } from './StyledDropdown'

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
  
  // Helper functions to get display labels
  const getPriorityLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Priority',
      'at-risk': 'At-Risk',
      'opportunity': 'Opportunity',
      'lead': 'Lead',
      'follow-up': 'Follow-Up',
      'no-action': 'No Action',
    }
    return labels[value] || 'All Priority'
  }

  const getAssigneeLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Assignees',
      'john-smith': 'John Smith',
      'emily-davis': 'Emily Davis',
      'michael-chen': 'Michael Chen',
      'unassigned': 'Unassigned',
    }
    return labels[value] || 'All Assignees'
  }

  const getTimeframeLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Time',
      'today': 'Today',
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
    }
    return labels[value] || 'All Time'
  }

  const getRankingLabel = (value: 'priority' | 'most-recent') => {
    return value === 'priority' ? 'Priority' : 'Most Recent'
  }

  return (
    <Card padding={6}>
      <View direction="column" gap={4}>
        {/* Filters Row */}
        <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
          {/* Ranking Filter */}
          <View direction="row" gap={2} align="center">
            <Icon svg={<ArrowsDownUp size={18} weight="bold" />} size={4} />
            <Text variant="body-2" weight="medium">Ranked by:</Text>
            <StyledDropdown trigger={<Text>{getRankingLabel(rankingOption)}</Text>}>
              <StyledDropdown.Item onClick={() => onRankingChange?.('priority')}>
                Priority
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onRankingChange?.('most-recent')}>
                Most Recent
              </StyledDropdown.Item>
            </StyledDropdown>
          </View>

          {/* Vertical Divider */}
          <View
            attributes={{
              style: {
                width: '1px',
                height: '24px',
                backgroundColor: 'var(--rs-color-border-neutral)',
              }
            }}
          />

          <View direction="row" gap={2} align="center">
            <Funnel size={18} weight="bold" />
            <Text variant="body-2" weight="medium">
              Filter by:
            </Text>
          </View>

          {/* Priority Filter */}
          <View direction="row" gap={2} align="center">
            <Text variant="body-2" weight="medium">Priority:</Text>
            <StyledDropdown trigger={<Text>{getPriorityLabel(priorityFilter)}</Text>}>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('all')}>
                All Priority
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('at-risk')}>
                At-Risk
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('opportunity')}>
                Opportunity
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('lead')}>
                Lead
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('follow-up')}>
                Follow-Up
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onPriorityChange?.('no-action')}>
                No Action
              </StyledDropdown.Item>
            </StyledDropdown>
          </View>

          {/* Assignee Filter */}
          <View direction="row" gap={2} align="center">
            <Text variant="body-2" weight="medium">Assignee:</Text>
            <StyledDropdown trigger={<Text>{getAssigneeLabel(assigneeFilter)}</Text>}>
              <StyledDropdown.Item onClick={() => onAssigneeChange?.('all')}>
                All Assignees
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onAssigneeChange?.('john-smith')}>
                John Smith
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onAssigneeChange?.('emily-davis')}>
                Emily Davis
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onAssigneeChange?.('michael-chen')}>
                Michael Chen
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onAssigneeChange?.('unassigned')}>
                Unassigned
              </StyledDropdown.Item>
            </StyledDropdown>
          </View>

          {/* Timeframe Filter */}
          <View direction="row" gap={2} align="center">
            <Text variant="body-2" weight="medium">Timeframe:</Text>
            <StyledDropdown trigger={<Text>{getTimeframeLabel(timeframeFilter)}</Text>}>
              <StyledDropdown.Item onClick={() => onTimeframeChange?.('all')}>
                All Time
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onTimeframeChange?.('today')}>
                Today
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onTimeframeChange?.('24h')}>
                Last 24 Hours
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onTimeframeChange?.('7d')}>
                Last 7 Days
              </StyledDropdown.Item>
              <StyledDropdown.Item onClick={() => onTimeframeChange?.('30d')}>
                Last 30 Days
              </StyledDropdown.Item>
            </StyledDropdown>
          </View>

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
      </View>
    </Card>
  )
}
