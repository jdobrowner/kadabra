import { Container, View, Card, Text, Select, Button } from 'reshaped'
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  return (
    <Container>
      <View direction="column" gap={6}>
        <View>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Historic Search
          </h1>
          <p style={{ margin: 0, color: 'var(--rs-color-neutral-faded)', fontSize: '14px' }}>
            Search through all customers, conversations, and action plans
          </p>
        </View>

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

              <Select
                name="type"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as any)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'customers', label: 'Customers' },
                  { value: 'conversations', label: 'Conversations' },
                  { value: 'action-plans', label: 'Action Plans' },
                ]}
                attributes={{ style: { minWidth: '150px' } }}
              />

              <Select
                name="priority"
                value={priorityFilter}
                onChange={(value) => {
                  const val = typeof value === 'string' ? value : value?.value || 'all'
                  setPriorityFilter(val)
                }}
                options={[
                  { value: 'all', label: 'All Priority' },
                  { value: 'at-risk', label: 'At-Risk' },
                  { value: 'opportunity', label: 'Opportunity' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'follow-up', label: 'Follow-Up' },
                  { value: 'no-action', label: 'No Action' },
                ]}
                attributes={{ style: { minWidth: '150px' } }}
              />

              <Select
                name="status"
                value={statusFilter}
                onChange={(value) => {
                  const val = typeof value === 'string' ? value : value?.value || 'all'
                  setStatusFilter(val)
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ]}
                attributes={{ style: { minWidth: '150px' } }}
              />

              <Select
                name="sort"
                value={sortBy}
                onChange={(value) => {
                  const val = typeof value === 'string' ? value : value?.value || 'recent'
                  setSortBy(val as 'recent' | 'relevance')
                }}
                options={[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'relevance', label: 'Relevance' },
                ]}
                attributes={{ style: { minWidth: '150px' } }}
              />

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
