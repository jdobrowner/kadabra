import { useEffect, useMemo, useState } from 'react'
import { View, Text, Button, Table, Icon, DropdownMenu } from 'reshaped'
import { Plus, Columns, CaretDown } from '@phosphor-icons/react'
import { useBoardsStore } from '../../store/useBoardsStore'
import { useTeamsStore } from '../../store/useTeamsStore'

const cardTypeLabels: Record<'lead' | 'case' | 'deal' | 'task' | 'custom', string> = {
  lead: 'Leads',
  case: 'Cases',
  deal: 'Deals',
  task: 'Tasks',
  custom: 'Custom',
}

export default function BoardsTab() {
  const boards = useBoardsStore((state) => state.boards)
  const boardsLoading = useBoardsStore((state) => state.boardsLoading)
  const boardsError = useBoardsStore((state) => state.boardsError)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)
  const fetchBoard = useBoardsStore((state) => state.fetchBoard)
  const selectedBoard = useBoardsStore((state) => state.selectedBoard)
  const boardLoading = useBoardsStore((state) => state.boardLoading)
  const createBoard = useBoardsStore((state) => state.createBoard)
  const updateBoard = useBoardsStore((state) => state.updateBoard)
  const deleteBoard = useBoardsStore((state) => state.deleteBoard)
  const createColumn = useBoardsStore((state) => state.createColumn)
  const updateColumn = useBoardsStore((state) => state.updateColumn)
  const reorderColumns = useBoardsStore((state) => state.reorderColumns)
  const deleteColumn = useBoardsStore((state) => state.deleteColumn)
  const addPermission = useBoardsStore((state) => state.addPermission)
  const removePermission = useBoardsStore((state) => state.removePermission)

  const teams = useTeamsStore((state) => state.teams)
  const fetchTeams = useTeamsStore((state) => state.fetchTeams)

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [newBoardVisibility, setNewBoardVisibility] = useState<'org' | 'team'>('team')
  const [newBoardType, setNewBoardType] = useState<'lead' | 'case' | 'deal' | 'task' | 'custom'>('custom')
  const [newBoardDefaultTeam, setNewBoardDefaultTeam] = useState<string>('')
  const [creatingBoard, setCreatingBoard] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [addingPermission, setAddingPermission] = useState(false)
  const [permissionTeamId, setPermissionTeamId] = useState('')
  const [permissionMode, setPermissionMode] = useState<'edit' | 'view'>('edit')

  useEffect(() => {
    fetchBoards()
    fetchTeams()
  }, [fetchBoards, fetchTeams])

  useEffect(() => {
    if (selectedBoardId) {
      fetchBoard(selectedBoardId)
    }
  }, [selectedBoardId, fetchBoard])

  const availableTeamsForPermission = useMemo(() => {
    if (!selectedBoard) {
      return []
    }
    const assignedTeamIds = new Set(selectedBoard.permissions.map((perm) => perm.teamId))
    if (selectedBoard.board.defaultTeamId) {
      assignedTeamIds.add(selectedBoard.board.defaultTeamId)
    }
    return teams.filter((team) => !assignedTeamIds.has(team.id))
  }, [selectedBoard, teams])

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      alert('Board name is required')
      return
    }
    setCreatingBoard(true)
    try {
      const boardId = await createBoard({
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || undefined,
        visibility: newBoardVisibility,
        cardType: newBoardType,
        defaultTeamId: newBoardVisibility === 'team' ? (newBoardDefaultTeam || null) : null,
      })
      setSelectedBoardId(boardId)
      setShowCreateForm(false)
      setNewBoardName('')
      setNewBoardDescription('')
      setNewBoardDefaultTeam('')
      setNewBoardType('custom')
      setNewBoardVisibility('team')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create board')
    } finally {
      setCreatingBoard(false)
    }
  }

  const handleUpdateBoardVisibility = async (boardId: string, visibility: 'org' | 'team') => {
    try {
      await updateBoard({ id: boardId, visibility })
      fetchBoard(boardId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update board visibility')
    }
  }

  const handleUpdateBoardType = async (boardId: string, cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom') => {
    try {
      await updateBoard({ id: boardId, cardType })
      fetchBoard(boardId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update board type')
    }
  }

  const handleReorderColumn = async (direction: 'up' | 'down', columnId: string) => {
    if (!selectedBoard) {
      return
    }
    const columnOrder = [...selectedBoard.columns]
    const index = columnOrder.findIndex((column) => column.id === columnId)
    if (index === -1) {
      return
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= columnOrder.length) {
      return
    }
    const swapped = [...columnOrder]
    const [moving] = swapped.splice(index, 1)
    swapped.splice(targetIndex, 0, moving)
    await reorderColumns(selectedBoard.board.id, swapped.map((column) => column.id))
  }

  const handleRenameColumn = async (columnId: string, currentName: string) => {
    const name = prompt('Rename column', currentName)
    if (!name || !name.trim()) {
      return
    }
    await updateColumn({ columnId, name: name.trim() })
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Delete this column and its cards?')) {
      return
    }
    await deleteColumn(columnId)
  }

  const handleAddPermission = async () => {
    if (!selectedBoard || !permissionTeamId) {
      return
    }
    setAddingPermission(true)
    try {
      await addPermission({ boardId: selectedBoard.board.id, teamId: permissionTeamId, mode: permissionMode })
      setPermissionTeamId('')
      setPermissionMode('edit')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add permission')
    } finally {
      setAddingPermission(false)
    }
  }

  const handleRemovePermission = async (permissionId: string) => {
    if (!confirm('Remove this team from the board?')) {
      return
    }
    await removePermission(permissionId)
  }

  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    if (!confirm(`Delete board "${boardName}"?`)) {
      return
    }
    try {
      await deleteBoard(boardId)
      if (selectedBoardId === boardId) {
        setSelectedBoardId(null)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete board')
    }
  }

  return (
    <View direction="column" gap={6}>
      <View direction="column" gap={3}>
        <View direction="row" justify="space-between" align="center">
          <View direction="column" gap={1}>
            <Text variant="body-1" weight="medium">
              Boards
            </Text>
            <Text variant="body-2" color="neutral-faded">
              Configure Kanban boards and control team access
            </Text>
          </View>
          <Button
            variant="outline"
            icon={<Icon svg={<Plus weight="bold" />} size={4} />}
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? 'Cancel' : 'Create Board'}
          </Button>
        </View>

        {showCreateForm && (
          <View
            direction="column"
            gap={4}
            padding={4}
            attributes={{
              style: {
                border: '1px solid var(--rs-color-border-neutral)',
                borderRadius: '8px',
                backgroundColor: 'var(--rs-color-background-neutral)',
              },
            }}
          >
            <View direction="column" gap={3}>
              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Board name
                </Text>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g. Customer Cases"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--rs-color-border-neutral)',
                    backgroundColor: 'var(--rs-color-background-neutral)',
                    fontSize: '14px',
                  }}
                />
              </View>

              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Description
                </Text>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--rs-color-border-neutral)',
                    backgroundColor: 'var(--rs-color-background-neutral)',
                    fontSize: '14px',
                  }}
                />
              </View>

              <View direction="row" gap={3}>
                <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
                  <Text variant="caption-1" weight="medium">
                    Visibility
                  </Text>
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
                              width: '100%',
                              justifyContent: 'space-between',
                            }
                          }}
                        >
                          <View direction="row" gap={2} align="center" attributes={{ style: { width: '100%', justifyContent: 'space-between' } }}>
                            <Text>
                              {newBoardVisibility === 'org' ? 'Entire organization' : 'Specific teams'}
                            </Text>
                            <CaretDown size={16} weight="bold" />
                          </View>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item onClick={() => setNewBoardVisibility('team')}>
                        Specific teams
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => setNewBoardVisibility('org')}>
                        Entire organization
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </View>
                <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
                  <Text variant="caption-1" weight="medium">
                    Card type
                  </Text>
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
                              width: '100%',
                              justifyContent: 'space-between',
                            }
                          }}
                        >
                          <View direction="row" gap={2} align="center" attributes={{ style: { width: '100%', justifyContent: 'space-between' } }}>
                            <Text>{cardTypeLabels[newBoardType]}</Text>
                            <CaretDown size={16} weight="bold" />
                          </View>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      {(['lead', 'case', 'deal', 'task', 'custom'] as const).map((type) => (
                        <DropdownMenu.Item
                          key={type}
                          onClick={() => setNewBoardType(type)}
                        >
                          {cardTypeLabels[type]}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </View>
              </View>

              {newBoardVisibility === 'team' && (
                <View direction="column" gap={1}>
                  <Text variant="caption-1" weight="medium">
                    Default team
                  </Text>
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
                              width: '100%',
                              justifyContent: 'space-between',
                            }
                          }}
                        >
                          <View direction="row" gap={2} align="center" attributes={{ style: { width: '100%', justifyContent: 'space-between' } }}>
                            <Text>
                              {newBoardDefaultTeam ? teams.find(t => t.id === newBoardDefaultTeam)?.name || 'Select team...' : 'Select team...'}
                            </Text>
                            <CaretDown size={16} weight="bold" />
                          </View>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item onClick={() => setNewBoardDefaultTeam('')}>
                        Select team...
                      </DropdownMenu.Item>
                      {teams.map((team) => (
                        <DropdownMenu.Item
                          key={team.id}
                          onClick={() => setNewBoardDefaultTeam(team.id)}
                        >
                          {team.name}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </View>
              )}

              <View direction="row" justify="end" gap={2}>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBoard} disabled={creatingBoard || !newBoardName.trim()}>
                  {creatingBoard ? 'Creating...' : 'Create Board'}
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>

      {boardsLoading && boards.length === 0 ? (
        <View align="center" padding={12}>
          <Text variant="body-1" color="neutral-faded">
            Loading boards...
          </Text>
        </View>
      ) : boardsError ? (
        <View direction="column" gap={4} padding={6}>
          <Text variant="body-1" color="critical">
            Error loading boards: {boardsError.message}
          </Text>
          <Button onClick={fetchBoards}>Try Again</Button>
        </View>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Board</Table.Cell>
              <Table.Cell>Visibility</Table.Cell>
              <Table.Cell>Card Type</Table.Cell>
              <Table.Cell>Default Team</Table.Cell>
              <Table.Cell width="220px"></Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {boards.map((board) => {
              const isSelected = board.id === selectedBoardId
              return (
                <Table.Row key={board.id} attributes={{ style: { backgroundColor: isSelected ? 'var(--rs-color-background-neutral-stronger)' : undefined } }}>
                  <Table.Cell>
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
                  </Table.Cell>
                  <Table.Cell>
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
                                paddingLeft: '12px',
                                paddingRight: '8px',
                                fontSize: '13px',
                              }
                            }}
                          >
                            <View direction="row" gap={2} align="center">
                              <Text>
                                {board.visibility === 'org' ? 'Organization' : 'Teams'}
                              </Text>
                              <CaretDown size={14} weight="bold" />
                            </View>
                          </Button>
                        )}
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => handleUpdateBoardVisibility(board.id, 'org')}>
                          Organization
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => handleUpdateBoardVisibility(board.id, 'team')}>
                          Teams
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </Table.Cell>
                  <Table.Cell>
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
                                paddingLeft: '12px',
                                paddingRight: '8px',
                                fontSize: '13px',
                              }
                            }}
                          >
                            <View direction="row" gap={2} align="center">
                              <Text>{cardTypeLabels[board.cardType]}</Text>
                              <CaretDown size={14} weight="bold" />
                            </View>
                          </Button>
                        )}
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {(['lead', 'case', 'deal', 'task', 'custom'] as const).map((type) => (
                          <DropdownMenu.Item
                            key={type}
                            onClick={() => handleUpdateBoardType(board.id, type)}
                          >
                            {cardTypeLabels[type]}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-2" color="neutral-faded">
                      {board.defaultTeamId ? teams.find((team) => team.id === board.defaultTeamId)?.name ?? 'Team' : '—'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" gap={2} justify="end">
                      <Button variant="ghost" size="small" onClick={() => setSelectedBoardId(isSelected ? null : board.id)}>
                        {isSelected ? 'Hide' : 'Configure'}
                      </Button>
                      <Button variant="ghost" size="small" color="critical" onClick={() => handleDeleteBoard(board.id, board.name)}>
                        Delete
                      </Button>
                    </View>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}

      {selectedBoardId && (
        <View
          direction="column"
          gap={4}
          padding={4}
          attributes={{
            style: {
              border: '1px solid var(--rs-color-border-neutral)',
              borderRadius: '8px',
              backgroundColor: 'var(--rs-color-background-neutral)',
            },
          }}
        >
          {boardLoading || !selectedBoard ? (
            <View align="center" padding={6}>
              <Text variant="body-1" color="neutral-faded">
                Loading board details...
              </Text>
            </View>
          ) : (
            <View direction="column" gap={4}>
              <View direction="column" gap={1}>
                <Text variant="body-1" weight="medium">
                  {selectedBoard.board.name}
                </Text>
                {selectedBoard.board.description && (
                  <Text variant="body-2" color="neutral-faded">
                    {selectedBoard.board.description}
                  </Text>
                )}
              </View>

              <View direction="column" gap={2}>
                <View direction="row" justify="space-between" align="center">
                  <Text variant="body-2" weight="medium">
                    Columns
                  </Text>
                  <View direction="row" gap={2}>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Column name"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--rs-color-border-neutral)',
                        backgroundColor: 'var(--rs-color-background-neutral)',
                        fontSize: '14px',
                      }}
                    />
                    <Button
                      size="small"
                      disabled={!newColumnName.trim()}
                      onClick={async () => {
                        if (!newColumnName.trim()) return
                        await createColumn(selectedBoard.board.id, newColumnName.trim())
                        setNewColumnName('')
                      }}
                    >
                      Add Column
                    </Button>
                  </View>
                </View>

                {selectedBoard.columns.length === 0 ? (
                  <Text variant="body-2" color="neutral-faded">
                    This board has no columns yet.
                  </Text>
                ) : (
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.Cell>Column</Table.Cell>
                        <Table.Cell width="160px">WIP Limit</Table.Cell>
                        <Table.Cell width="220px"></Table.Cell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {selectedBoard.columns.map((column, index) => (
                        <Table.Row key={column.id}>
                          <Table.Cell>
                            <View direction="row" gap={3} align="center">
                              <Icon svg={<Columns weight="bold" />} size={4} />
                              <Text variant="body-2">{column.name}</Text>
                            </View>
                          </Table.Cell>
                          <Table.Cell>
                            <Text variant="body-2" color="neutral-faded">
                              {column.wipLimit ?? '—'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <View direction="row" gap={2} justify="end">
                              <Button variant="ghost" size="small" onClick={() => handleReorderColumn('up', column.id)} disabled={index === 0}>
                                ↑
                              </Button>
                              <Button variant="ghost" size="small" onClick={() => handleReorderColumn('down', column.id)} disabled={index === selectedBoard.columns.length - 1}>
                                ↓
                              </Button>
                              <Button variant="ghost" size="small" onClick={() => handleRenameColumn(column.id, column.name)}>
                                Rename
                              </Button>
                              <Button variant="ghost" size="small" onClick={async () => {
                                const value = prompt('Set WIP limit (leave empty to clear)', column.wipLimit?.toString() ?? '')
                                if (value === null) return
                                const parsed = value.trim() === '' ? null : Number(value)
                                if (parsed !== null && Number.isNaN(parsed)) {
                                  alert('Please enter a valid number')
                                  return
                                }
                                await updateColumn({ columnId: column.id, wipLimit: parsed })
                              }}>
                                WIP
                              </Button>
                              <Button variant="ghost" size="small" color="critical" onClick={() => handleDeleteColumn(column.id)}>
                                Delete
                              </Button>
                            </View>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </View>

              <View direction="column" gap={2}>
                <Text variant="body-2" weight="medium">
                  Team access
                </Text>
                {selectedBoard.permissions.length === 0 ? (
                  <Text variant="body-2" color="neutral-faded">
                    No additional team permissions configured.
                  </Text>
                ) : (
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.Cell>Team</Table.Cell>
                        <Table.Cell>Mode</Table.Cell>
                        <Table.Cell width="80px"></Table.Cell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {selectedBoard.permissions.map((permission) => (
                        <Table.Row key={permission.id}>
                          <Table.Cell>
                            <Text variant="body-2">
                              {teams.find((team) => team.id === permission.teamId)?.name ?? 'Team'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text variant="body-2" color="neutral-faded">
                              {permission.mode === 'edit' ? 'Editor' : 'Viewer'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Button variant="ghost" size="small" color="critical" onClick={() => handleRemovePermission(permission.id)}>
                              Remove
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}

                <View direction="row" gap={2} align="center" justify="space-between" paddingTop={2}>
                  <Text variant="caption-1" weight="medium">
                    Add team permission
                  </Text>
                  <View direction="row" gap={2}>
                    <DropdownMenu>
                      <DropdownMenu.Trigger>
                        {(attributes) => (
                          <Button
                            {...attributes}
                            variant="outline"
                            size="small"
                            disabled={availableTeamsForPermission.length === 0}
                            attributes={{
                              style: {
                                borderRadius: '30px',
                                paddingLeft: '12px',
                                paddingRight: '8px',
                              }
                            }}
                          >
                            <View direction="row" gap={2} align="center">
                              <Text>
                                {permissionTeamId
                                  ? availableTeamsForPermission.find(t => t.id === permissionTeamId)?.name || 'Select team...'
                                  : availableTeamsForPermission.length === 0
                                  ? 'All teams assigned'
                                  : 'Select team...'}
                              </Text>
                              <CaretDown size={14} weight="bold" />
                            </View>
                          </Button>
                        )}
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {availableTeamsForPermission.length === 0 ? (
                          <DropdownMenu.Item disabled>All teams assigned</DropdownMenu.Item>
                        ) : (
                          <>
                            <DropdownMenu.Item onClick={() => setPermissionTeamId('')}>
                              Select team...
                            </DropdownMenu.Item>
                            {availableTeamsForPermission.map((team) => (
                              <DropdownMenu.Item
                                key={team.id}
                                onClick={() => setPermissionTeamId(team.id)}
                              >
                                {team.name}
                              </DropdownMenu.Item>
                            ))}
                          </>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu>
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
                                paddingLeft: '12px',
                                paddingRight: '8px',
                              }
                            }}
                          >
                            <View direction="row" gap={2} align="center">
                              <Text>{permissionMode === 'edit' ? 'Editor' : 'Viewer'}</Text>
                              <CaretDown size={14} weight="bold" />
                            </View>
                          </Button>
                        )}
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => setPermissionMode('edit')}>
                          Editor
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setPermissionMode('view')}>
                          Viewer
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                    <Button size="small" disabled={addingPermission || !permissionTeamId} onClick={handleAddPermission}>
                      {addingPermission ? 'Adding...' : 'Add'}
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
