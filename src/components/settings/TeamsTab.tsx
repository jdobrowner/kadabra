import { useEffect, useMemo, useState } from 'react'
import { View, Text, Button, Table, Icon, DropdownMenu } from 'reshaped'
import { Plus, UsersThree, Funnel, CaretDown } from '@phosphor-icons/react'
import { useTeamsStore } from '../../store/useTeamsStore'
import { useUsersStore } from '../../store/useUsersStore'

export default function TeamsTab() {
  const teams = useTeamsStore((state) => state.teams)
  const teamsLoading = useTeamsStore((state) => state.teamsLoading)
  const teamsError = useTeamsStore((state) => state.teamsError)
  const fetchTeams = useTeamsStore((state) => state.fetchTeams)
  const fetchTeam = useTeamsStore((state) => state.fetchTeam)
  const selectedTeam = useTeamsStore((state) => state.selectedTeam)
  const teamLoading = useTeamsStore((state) => state.teamLoading)
  const createTeam = useTeamsStore((state) => state.createTeam)
  const updateTeam = useTeamsStore((state) => state.updateTeam)
  const deleteTeam = useTeamsStore((state) => state.deleteTeam)
  const addMember = useTeamsStore((state) => state.addMember)
  const removeMember = useTeamsStore((state) => state.removeMember)

  const users = useUsersStore((state) => state.users)
  const usersLoading = useUsersStore((state) => state.usersLoading)
  const fetchUsers = useUsersStore((state) => state.fetchUsers)

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [updatingTeamId, setUpdatingTeamId] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
    fetchUsers()
  }, [fetchTeams, fetchUsers])

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeam(selectedTeamId)
    }
  }, [selectedTeamId, fetchTeam])

  const membersNotInTeam = useMemo(() => {
    if (!selectedTeam) {
      return []
    }
    const memberIds = new Set(selectedTeam.members.map((member) => member.userId))
    return users.filter((user) => !memberIds.has(user.id))
  }, [selectedTeam, users])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      alert('Team name is required')
      return
    }
    setCreatingTeam(true)
    try {
      const teamId = await createTeam({ name: newTeamName.trim(), description: newTeamDesc.trim() || undefined })
      setSelectedTeamId(teamId)
      setShowCreateForm(false)
      setNewTeamName('')
      setNewTeamDesc('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create team')
    } finally {
      setCreatingTeam(false)
    }
  }

  const handleToggleStatus = async (teamId: string, status: 'active' | 'archived') => {
    setUpdatingTeamId(teamId)
    try {
      await updateTeam({ id: teamId, status: status === 'active' ? 'archived' : 'active' })
      if (selectedTeamId === teamId) {
        fetchTeam(teamId)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update team status')
    } finally {
      setUpdatingTeamId(null)
    }
  }

  const handleToggleAssignable = async (teamId: string, current: boolean) => {
    setUpdatingTeamId(teamId)
    try {
      await updateTeam({ id: teamId, isAssignable: !current })
      if (selectedTeamId === teamId) {
        fetchTeam(teamId)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update team settings')
    } finally {
      setUpdatingTeamId(null)
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Archive and delete team "${teamName}"?`)) {
      return
    }
    try {
      await deleteTeam(teamId)
      if (selectedTeamId === teamId) {
        setSelectedTeamId(null)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete team')
    }
  }

  const handleAddMember = async (teamId: string, userId: string) => {
    if (!userId) {
      return
    }
    try {
      await addMember({ teamId, userId })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add member')
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this team?`)) {
      return
    }
    try {
      await removeMember(teamId, userId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  return (
    <View direction="column" gap={6}>
      <View direction="column" gap={3}>
        <View direction="row" justify="space-between" align="center">
          <View direction="column" gap={1}>
            <Text variant="body-1" weight="medium">
              Teams
            </Text>
            <Text variant="body-2" color="neutral-faded">
              Organize your workspace into functional teams and manage memberships
            </Text>
          </View>
          <Button
            variant="outline"
            icon={<Icon svg={<Plus weight="bold" />} size={4} />}
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? 'Cancel' : 'Create Team'}
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
                  Team name
                </Text>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Customer Support"
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
                  Description (optional)
                </Text>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
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

              <View direction="row" justify="end" gap={2}>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={creatingTeam || !newTeamName.trim()}>
                  {creatingTeam ? 'Creating...' : 'Create Team'}
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>

      {teamsLoading && teams.length === 0 ? (
        <View align="center" padding={12}>
          <Text variant="body-1" color="neutral-faded">
            Loading teams...
          </Text>
        </View>
      ) : teamsError ? (
        <View direction="column" gap={4} padding={6}>
          <Text variant="body-1" color="critical">
            Error loading teams: {teamsError.message}
          </Text>
          <Button onClick={fetchTeams}>Try Again</Button>
        </View>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Team</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell>Members</Table.Cell>
              <Table.Cell>Boards</Table.Cell>
              <Table.Cell width="180px"></Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {teams.map((team) => {
              const isSelected = team.id === selectedTeamId
              const isUpdating = updatingTeamId === team.id
              return (
                <Table.Row key={team.id} attributes={{ style: { backgroundColor: isSelected ? 'var(--rs-color-background-neutral-stronger)' : undefined } }}>
                  <Table.Cell>
                    <View direction="column" gap={1}>
                      <Text variant="body-2" weight="medium">
                        {team.name}
                      </Text>
                      {team.description && (
                        <Text variant="caption-1" color="neutral-faded">
                          {team.description}
                        </Text>
                      )}
                    </View>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-2" color={team.status === 'active' ? 'positive' : 'neutral-faded'}>
                      {team.status === 'active' ? 'Active' : 'Archived'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" gap={2} align="center">
                      <Icon svg={<UsersThree weight="bold" />} size={4} />
                      <Text variant="body-2">{team.memberCount}</Text>
                    </View>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" gap={2} align="center">
                      <Icon svg={<Funnel weight="bold" />} size={4} />
                      <Text variant="body-2">{team.boardCount}</Text>
                    </View>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" gap={2} justify="end">
                      <Button variant="ghost" size="small" onClick={() => setSelectedTeamId(isSelected ? null : team.id)}>
                        {isSelected ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleToggleStatus(team.id, team.status)}
                        disabled={isUpdating}
                      >
                        {team.status === 'active' ? 'Archive' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleToggleAssignable(team.id, team.isAssignable)}
                        disabled={isUpdating}
                      >
                        {team.isAssignable ? 'Restrict' : 'Allow Assignments'}
                      </Button>
                      <Button variant="ghost" size="small" color="critical" onClick={() => handleDeleteTeam(team.id, team.name)}>
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

      {selectedTeamId && (
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
          {teamLoading || !selectedTeam ? (
            <View align="center" padding={6}>
              <Text variant="body-1" color="neutral-faded">
                Loading team details...
              </Text>
            </View>
          ) : (
            <View direction="column" gap={4}>
              <View direction="column" gap={1}>
                <Text variant="body-1" weight="medium">
                  {selectedTeam.team.name}
                </Text>
                {selectedTeam.team.description && (
                  <Text variant="body-2" color="neutral-faded">
                    {selectedTeam.team.description}
                  </Text>
                )}
              </View>

              <View direction="column" gap={2}>
                <Text variant="body-2" weight="medium">
                  Team members
                </Text>
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell>Name</Table.Cell>
                      <Table.Cell>Email</Table.Cell>
                      <Table.Cell>Role</Table.Cell>
                      <Table.Cell width="80px"></Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {selectedTeam.members.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <Text variant="body-2" color="neutral-faded">
                            No members assigned yet
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      selectedTeam.members.map((member) => (
                        <Table.Row key={member.membershipId}>
                          <Table.Cell>
                            <Text variant="body-2">{member.name}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text variant="body-2" color="neutral-faded">
                              {member.email}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text variant="body-2" color="neutral-faded">
                              {member.role}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              variant="ghost"
                              size="small"
                              color="critical"
                              onClick={() => handleRemoveMember(selectedTeam.team.id, member.userId, member.name)}
                            >
                              Remove
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>

                <View direction="row" gap={2} align="center" justify="space-between" paddingTop={2}>
                  <Text variant="caption-1" weight="medium">
                    Add member
                  </Text>
                  <DropdownMenu>
                    <DropdownMenu.Trigger>
                      {(attributes) => (
                        <Button
                          {...attributes}
                          variant="outline"
                          size="small"
                          disabled={usersLoading || membersNotInTeam.length === 0}
                          attributes={{
                            style: {
                              borderRadius: '30px',
                              paddingLeft: '16px',
                              paddingRight: '12px',
                              minWidth: '220px',
                            }
                          }}
                        >
                          <View direction="row" gap={2} align="center" attributes={{ style: { width: '100%', justifyContent: 'space-between' } }}>
                            <Text>
                              {membersNotInTeam.length === 0 ? 'No available users' : 'Select user...'}
                            </Text>
                            <CaretDown size={16} weight="bold" />
                          </View>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      {membersNotInTeam.length === 0 ? (
                        <DropdownMenu.Item disabled>No available users</DropdownMenu.Item>
                      ) : (
                        <>
                          <DropdownMenu.Item onClick={() => {}} disabled>
                            Select user...
                          </DropdownMenu.Item>
                          {membersNotInTeam.map((user) => (
                            <DropdownMenu.Item
                              key={user.id}
                              onClick={() => {
                                handleAddMember(selectedTeam.team.id, user.id)
                              }}
                            >
                              {user.name || user.email}
                            </DropdownMenu.Item>
                          ))}
                        </>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </View>
              </View>

              <View direction="column" gap={2}>
                <Text variant="body-2" weight="medium">
                  Linked boards
                </Text>
                {selectedTeam.boards.length === 0 ? (
                  <Text variant="body-2" color="neutral-faded">
                    This team does not have access to any boards yet.
                  </Text>
                ) : (
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.Cell>Board</Table.Cell>
                        <Table.Cell>Mode</Table.Cell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {selectedTeam.boards.map((board) => (
                        <Table.Row key={board.permissionId}>
                          <Table.Cell>{board.boardName}</Table.Cell>
                          <Table.Cell>
                            <Text variant="body-2" color="neutral-faded">
                              {board.mode === 'edit' ? 'Editor' : 'Viewer'}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
