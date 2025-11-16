import { useEffect, useState } from 'react'
import { View, Text, Button, Table, Avatar, Icon } from 'reshaped'
import { Trash, UserCircle } from '@phosphor-icons/react'
import { StyledDropdown } from '../custom/StyledDropdown'
import { useUsersStore } from '../../store/useUsersStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function UsersTab() {
  const { user: currentUser } = useAuthStore()
  const users = useUsersStore((state) => state.users)
  const usersLoading = useUsersStore((state) => state.usersLoading)
  const usersError = useUsersStore((state) => state.usersError)
  const fetchUsers = useUsersStore((state) => state.fetchUsers)
  const removeUser = useUsersStore((state) => state.removeUser)
  const updateUserRole = useUsersStore((state) => state.updateUserRole)

  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      return
    }

    setRemovingUserId(userId)
    try {
      await removeUser(userId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove user')
    } finally {
      setRemovingUserId(null)
    }
  }

  const handleUpdateRole = async (userId: string, role: 'admin' | 'developer' | 'member') => {
    setUpdatingUserId(userId)
    try {
      await updateUserRole(userId, role)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'critical'
      case 'developer':
        return 'primary'
      case 'member':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  if (usersLoading && users.length === 0) {
    return (
      <View align="center" padding={12}>
        <Text variant="body-1" color="neutral-faded">
          Loading users...
        </Text>
      </View>
    )
  }

  if (usersError) {
    return (
      <View direction="column" gap={4} padding={6}>
        <Text variant="body-1" color="critical">
          Error loading users: {usersError.message}
        </Text>
        <Button onClick={() => fetchUsers()}>Try Again</Button>
      </View>
    )
  }

  return (
    <View direction="column" gap={4}>
      <View direction="row" justify="space-between" align="center">
        <Text variant="body-2" color="neutral-faded">
          {users.length} {users.length === 1 ? 'user' : 'users'} in your organization
        </Text>
      </View>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>User</Table.Cell>
            <Table.Cell>Email</Table.Cell>
            <Table.Cell>Role</Table.Cell>
            <Table.Cell>Joined</Table.Cell>
            <Table.Cell width="80px"></Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {users.map((user) => {
            const isCurrentUser = user.id === currentUser?.id
            const isRemoving = removingUserId === user.id
            const isUpdating = updatingUserId === user.id

            return (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <View direction="row" gap={3} align="center">
                    <Avatar
                      src={user.avatar || undefined}
                      alt={user.name}
                      size={8}
                    />
                    <View direction="column" gap={1}>
                      <Text variant="body-2" weight="medium">
                        {user.name}
                      </Text>
                      {isCurrentUser && (
                        <Text variant="caption-1" color="neutral-faded">
                          (You)
                        </Text>
                      )}
                    </View>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-2">{user.email}</Text>
                </Table.Cell>
                <Table.Cell>
                  <View direction="row" gap={2} align="center">
                    <View direction="row" gap={2} align="center">
                      <Text
                        variant="caption-1"
                        attributes={{
                          style: {
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: `var(--rs-color-${getRoleBadgeColor(user.role)}-background)`,
                            color: `var(--rs-color-${getRoleBadgeColor(user.role)}-foreground)`,
                            textTransform: 'capitalize',
                          },
                        }}
                      >
                        {user.role}
                      </Text>
                      {!isCurrentUser && !isUpdating && (
                        <StyledDropdown
                          trigger={<Text>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>}
                          triggerFontSize="14px"
                          triggerPaddingLeft="12px"
                          triggerPaddingRight="8px"
                        >
                          {(['admin', 'developer', 'member'] as const).map((role) => (
                            <StyledDropdown.Item
                              key={role}
                              onClick={() => handleUpdateRole(user.id, role)}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </StyledDropdown.Item>
                          ))}
                        </StyledDropdown>
                      )}
                    </View>
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-2" color="neutral-faded">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="small"
                      color="critical"
                      icon={<Icon svg={<Trash weight="bold" />} size={4} />}
                      onClick={() => handleRemoveUser(user.id, user.name)}
                      disabled={isRemoving}
                      attributes={{ 'aria-label': 'Remove user' }}
                    />
                  )}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      {users.length === 0 && (
        <View align="center" padding={12}>
          <View direction="column" gap={3} align="center">
            <Icon svg={<UserCircle weight="bold" />} size={10} color="neutral-faded" />
            <Text variant="body-1" color="neutral-faded">
              No users found
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

