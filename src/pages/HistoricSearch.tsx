import { Container, View, Card, Text, Button, DropdownMenu } from 'reshaped'
import { MagnifyingGlass, Funnel, CaretDown } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/custom/PageHeader'
import { useSearchStore } from '../store/useSearchStore'

export default function HistoricSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'customers' | 'conversations' | 'action-plans'>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'relevance'>('recent')

  // Get search results from store
  const results = useSearchStore((state) => state.results)
  const total = useSearchStore((state) => state.total)
  // const isLoading = useSearchStore((state) => state.loading) // TODO: Re-enable when needed
  const search = useSearchStore((state) => state.search)
  
  // Perform search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search({
        q: searchQuery || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter as any,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        sortBy,
      })
    }, searchQuery ? 300 : 0) // Debounce search input
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, typeFilter, statusFilter, priorityFilter, sortBy, search])

  const handleClearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'

  // Helper functions to get display labels
  const getTypeLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Types',
      'customers': 'Customers',
      'conversations': 'Conversations',
      'action-plans': 'Action Plans',
    }
    return labels[value] || 'All Types'
  }

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

  const getStatusLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Status',
      'active': 'Active',
      'completed': 'Completed',
    }
    return labels[value] || 'All Status'
  }

  const getSortLabel = (value: 'recent' | 'relevance') => {
    return value === 'recent' ? 'Most Recent' : 'Relevance'
  }

  return (
    <Container>
      <View direction="column" gap={6}>
        <PageHeader
          title="Historic Search"
          subtitle="Search through all customers, conversations, and action plans"
        />

        {/* Search and Filters */}
        <Card padding={6}>
          <View direction="column" gap={4}>
            <View direction="row" gap={2} align="center">
              <MagnifyingGlass size={20} weight="bold" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, conversations, action plans..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--rs-color-neutral-border)',
                  backgroundColor: 'var(--rs-color-neutral-surface)',
                  color: 'var(--rs-color-neutral-foreground)',
                  fontSize: '14px'
                }}
              />
            </View>

            <View direction="row" gap={4} align="center" attributes={{ style: { flexWrap: 'wrap' } }}>
              <View direction="row" gap={2} align="center">
                <Funnel size={18} weight="bold" />
                <Text variant="body-2" weight="medium">
                  Filters:
                </Text>
              </View>

              {/* Type Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium">Type:</Text>
                <DropdownMenu>
                  <DropdownMenu.Trigger>
                    {(attributes) => (
                      <Button
                        {...attributes}
                        variant="outline"
                        size="small"
                        attributes={{
                          style: {
                            borderRadius: '30px',
                            paddingLeft: '16px',
                            paddingRight: '12px',
                          }
                        }}
                      >
                        <View direction="row" gap={2} align="center">
                          <Text>{getTypeLabel(typeFilter)}</Text>
                          <CaretDown size={16} weight="bold" />
                        </View>
                      </Button>
                    )}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => setTypeFilter('all')}>
                      All Types
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setTypeFilter('customers')}>
                      Customers
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setTypeFilter('conversations')}>
                      Conversations
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setTypeFilter('action-plans')}>
                      Action Plans
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </View>

              {/* Priority Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium">Priority:</Text>
                <DropdownMenu>
                  <DropdownMenu.Trigger>
                    {(attributes) => (
                      <Button
                        {...attributes}
                        variant="outline"
                        size="small"
                        attributes={{
                          style: {
                            borderRadius: '30px',
                            paddingLeft: '16px',
                            paddingRight: '12px',
                          }
                        }}
                      >
                        <View direction="row" gap={2} align="center">
                          <Text>{getPriorityLabel(priorityFilter)}</Text>
                          <CaretDown size={16} weight="bold" />
                        </View>
                      </Button>
                    )}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('all')}>
                      All Priority
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('at-risk')}>
                      At-Risk
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('opportunity')}>
                      Opportunity
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('lead')}>
                      Lead
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('follow-up')}>
                      Follow-Up
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setPriorityFilter('no-action')}>
                      No Action
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </View>

              {/* Status Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium">Status:</Text>
                <DropdownMenu>
                  <DropdownMenu.Trigger>
                    {(attributes) => (
                      <Button
                        {...attributes}
                        variant="outline"
                        size="small"
                        attributes={{
                          style: {
                            borderRadius: '30px',
                            paddingLeft: '16px',
                            paddingRight: '12px',
                          }
                        }}
                      >
                        <View direction="row" gap={2} align="center">
                          <Text>{getStatusLabel(statusFilter)}</Text>
                          <CaretDown size={16} weight="bold" />
                        </View>
                      </Button>
                    )}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => setStatusFilter('all')}>
                      All Status
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setStatusFilter('active')}>
                      Active
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setStatusFilter('completed')}>
                      Completed
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </View>

              {/* Sort Filter */}
              <View direction="row" gap={2} align="center">
                <Text variant="body-2" weight="medium">Sort:</Text>
                <DropdownMenu>
                  <DropdownMenu.Trigger>
                    {(attributes) => (
                      <Button
                        {...attributes}
                        variant="outline"
                        size="small"
                        attributes={{
                          style: {
                            borderRadius: '30px',
                            paddingLeft: '16px',
                            paddingRight: '12px',
                          }
                        }}
                      >
                        <View direction="row" gap={2} align="center">
                          <Text>{getSortLabel(sortBy)}</Text>
                          <CaretDown size={16} weight="bold" />
                        </View>
                      </Button>
                    )}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => setSortBy('recent')}>
                      Most Recent
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => setSortBy('relevance')}>
                      Relevance
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </View>

              {hasActiveFilters && (
                <Button variant="outline" size="small" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </View>
          </View>
        </Card>

        {/* Results */}
        <View direction="column" gap={4}>
              <Text variant="body-2" color="neutral-faded">
                {total} result{total !== 1 ? 's' : ''} found
              </Text>

              <View direction="column" gap={3}>
                {results.map(result => (
                  <Link key={`${result.type}-${result.id}`} to={result.link}>
                    <Card padding={6} attributes={{ style: { cursor: 'pointer' } }}>
                      <View direction="column" gap={2}>
                        <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between', flexWrap: 'wrap' } }}>
                          <Text variant="body-2" weight="medium" color="primary">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1).replace('-', ' ')}
                          </Text>
                          <Text variant="caption-1" color="neutral-faded">
                            {new Date(result.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text variant="title-5" weight="bold">
                          {result.title}
                        </Text>
                        <Text variant="body-2" color="neutral-faded">
                          {result.subtitle}
                        </Text>
                      </View>
                    </Card>
                  </Link>
                ))}
              </View>

              {results.length === 0 && (
                <View attributes={{ style: { textAlign: 'center', padding: '40px' } }}>
                  <Text variant="body-2" color="neutral-faded">
                    No results found. Try adjusting your search or filters.
                  </Text>
                </View>
          )}
        </View>
      </View>
    </Container>
  )
}
