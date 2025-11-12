import { useMemo, useState } from 'react'
import { View, Text, Card, Button, Icon } from 'reshaped'
import { MagnifyingGlass, SquaresFour, UsersThree } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import type { BoardSummary } from '../../store/useBoardsStore'
import type { TeamSummary } from '../../store/useTeamsStore'

interface BoardsDirectoryProps {
  boards: BoardSummary[]
  teams: TeamSummary[]
  selectedBoardId?: string
  loading?: boolean
  onSelect: (boardId: string) => void
}

export function BoardsDirectory({ boards, teams, selectedBoardId, loading, onSelect }: BoardsDirectoryProps) {
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'org' | 'team'>('all')

  const filtersActive = teamFilter !== 'all' || visibilityFilter !== 'all' || Boolean(search.trim())

  const filteredBoards = useMemo(() => {
    const query = search.trim().toLowerCase()
    return boards.filter((board) => {
      if (visibilityFilter !== 'all' && board.visibility !== visibilityFilter) {
        return false
      }

      if (teamFilter !== 'all') {
        const hasTeam =
          board.defaultTeamId === teamFilter ||
          board.permissions.some((perm) => perm.teamId === teamFilter)
        if (!hasTeam) {
          return false
        }
      }

      if (!query) {
        return true
      }

      return (
        board.name.toLowerCase().includes(query) ||
        (board.description ?? '').toLowerCase().includes(query)
      )
    })
  }, [boards, visibilityFilter, teamFilter, search])

  return (
    <View direction="column" gap={4}>
      <View direction="column" gap={2}>
        <Text variant="title-5" weight="bold">
          Boards
        </Text>
        <Text variant="caption-1" color="neutral-faded">
          Browse your team workspaces and pick a board to manage
        </Text>
      </View>

      <View direction="column" gap={3}>
        <View
          attributes={{
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: '1px solid var(--rs-color-border-neutral)',
              borderRadius: '8px',
              backgroundColor: 'var(--rs-color-background-neutral)',
            },
          }}
        >
          <Icon svg={<MagnifyingGlass weight="bold" />} size={4} />
          <input
            aria-label="Search boards"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search boards"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--rs-color-foreground-neutral-stronger)',
            }}
          />
          {search && (
            <Button size="small" variant="ghost" onClick={() => setSearch('')}>
              Clear
            </Button>
          )}
        </View>

        <View direction="column" gap={2}>
          <Text variant="caption-1" weight="medium" color="neutral-faded">
            Filters
          </Text>
          <View direction="row" gap={2} wrap>
            <Button
              size="small"
              variant={teamFilter === 'all' ? 'solid' : 'outline'}
              onClick={() => setTeamFilter('all')}
              icon={<Icon svg={<UsersThree weight="bold" />} size={4} />}
            >
              All teams
            </Button>
            {teams.map((team) => (
              <Button
                key={team.id}
                size="small"
                variant={teamFilter === team.id ? 'solid' : 'outline'}
                onClick={() => setTeamFilter(team.id)}
              >
                {team.name}
              </Button>
            ))}
          </View>
          <View direction="row" gap={2} wrap>
            <Button
              size="small"
              variant={visibilityFilter === 'all' ? 'solid' : 'outline'}
              onClick={() => setVisibilityFilter('all')}
              icon={<Icon svg={<SquaresFour weight="bold" />} size={4} />}
            >
              All visibility
            </Button>
            <Button
              size="small"
              variant={visibilityFilter === 'org' ? 'solid' : 'outline'}
              onClick={() => setVisibilityFilter('org')}
            >
              Org-wide
            </Button>
            <Button
              size="small"
              variant={visibilityFilter === 'team' ? 'solid' : 'outline'}
              onClick={() => setVisibilityFilter('team')}
            >
              Team only
            </Button>
          </View>
        </View>
      </View>

      <View direction="column" gap={2}>
        {filtersActive && (
          <Text variant="caption-1" color="neutral-faded">
            Showing {filteredBoards.length} of {boards.length} boards
          </Text>
        )}
        {loading ? (
          <View padding={6} align="center">
            <Text variant="body-2" color="neutral-faded">
              Loading boards...
            </Text>
          </View>
        ) : filteredBoards.length === 0 ? (
          <Card padding={5}>
            <View direction="column" gap={2} align="center" justify="center">
              <Text variant="body-2" weight="medium">
                No boards match your filters
              </Text>
              <Text variant="caption-1" color="neutral-faded" align="center">
                Try adjusting the filters or clear them to see the full list.
              </Text>
            </View>
          </Card>
        ) : (
          <View direction="column" gap={3}>
            {filteredBoards.map((board) => {
              const isSelected = board.id === selectedBoardId
              const defaultTeamName =
                board.defaultTeamId ? teams.find((team) => team.id === board.defaultTeamId)?.name : null
              return (
                <Card
                  key={board.id}
                  padding={4}
                  attributes={{
                    style: {
                      border:
                        isSelected && filtersActive
                          ? '2px solid var(--rs-color-border-primary-stronger)'
                          : isSelected
                            ? '2px solid var(--rs-color-border-primary)'
                            : undefined,
                    },
                  }}
                >
                  <View direction="column" gap={2}>
                    <View direction="row" justify="space-between" align="center">
                      <View direction="column" gap={1}>
                        <Text variant="body-2" weight="medium">
                          {board.name}
                        </Text>
                        {board.description && (
                          <Text variant="caption-1" color="neutral-faded">
                            {board.description}
                          </Text>
                        )}
                      </View>
                      <Button size="small" variant={isSelected ? 'solid' : 'outline'} onClick={() => onSelect(board.id)}>
                        {isSelected ? 'Viewing' : 'Open'}
                      </Button>
                    </View>

                    <View direction="row" gap={2} wrap>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          backgroundColor: 'var(--rs-color-background-neutral-stronger)',
                          color: 'var(--rs-color-foreground-neutral-stronger)',
                        }}
                      >
                        <SquaresFour weight="bold" size={14} />
                        {board.cardType.toUpperCase()}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          backgroundColor: 'var(--rs-color-background-neutral-stronger)',
                          color: 'var(--rs-color-foreground-neutral-stronger)',
                        }}
                      >
                        {board.visibility === 'org' ? 'Org-wide' : 'Team only'}
                      </span>
                      {defaultTeamName && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--rs-color-background-success-faded)',
                            color: 'var(--rs-color-foreground-success-stronger)',
                          }}
                        >
                          <UsersThree weight="bold" size={14} />
                          Default team: {defaultTeamName}
                        </span>
                      )}
                    </View>
                  </View>
                </Card>
              )
            })}
          </View>
        )}
      </View>

      <Text variant="caption-1" color="neutral-faded">
        Need to add a new board? Visit{' '}
        <Link to="/settings?tab=boards">
          <Text variant="caption-1" weight="medium" color="primary">
            Settings → Boards
          </Text>
        </Link>
      </Text>
    </View>
  )
}

