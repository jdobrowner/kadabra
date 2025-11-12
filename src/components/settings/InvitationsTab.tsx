import { useEffect, useState } from 'react'
import { View, Text, Button, Table, Icon, Badge } from 'reshaped'
import { Plus, Trash, Copy, EnvelopeSimple, XCircle } from '@phosphor-icons/react'
import { useInvitationsStore } from '../../store/useInvitationsStore'

export default function InvitationsTab() {
  const invitations = useInvitationsStore((state) => state.invitations)
  const invitationsLoading = useInvitationsStore((state) => state.invitationsLoading)
  const invitationsError = useInvitationsStore((state) => state.invitationsError)
  const invitationsFilter = useInvitationsStore((state) => state.invitationsFilter)
  const fetchInvitations = useInvitationsStore((state) => state.fetchInvitations)
  const createInvitation = useInvitationsStore((state) => state.createInvitation)
  const cancelInvitation = useInvitationsStore((state) => state.cancelInvitation)

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'developer' | 'member'>('member')
  const [isCreating, setIsCreating] = useState(false)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitations(invitationsFilter)
  }, [fetchInvitations, invitationsFilter])

  const handleCreateInvitation = async () => {
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }

    setIsCreating(true)
    try {
      await createInvitation(email.trim(), role)
      setEmail('')
      setRole('member')
      setShowInviteForm(false)
      // Refresh list
      fetchInvitations(invitationsFilter)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create invitation')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingId(invitationId)
    try {
      await cancelInvitation(invitationId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel invitation')
    } finally {
      setCancelingId(null)
    }
  }

  const handleCopyInvitationLink = (token: string) => {
    const invitationUrl = `${window.location.origin}/signin?invitation=${token}`
    navigator.clipboard.writeText(invitationUrl)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'primary'
      case 'accepted':
        return 'positive'
      case 'expired':
      case 'canceled':
        return 'neutral'
      case 'rejected':
        return 'critical'
      default:
        return 'neutral'
    }
  }

  const filteredInvitations = invitations.filter((inv) => {
    if (invitationsFilter === 'all') return true
    return inv.status === invitationsFilter
  })

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending')

  return (
    <View direction="column" gap={6}>
      <View direction="row" justify="space-between" align="center">
        <View direction="column" gap={1}>
          <Text variant="body-2" color="neutral-faded">
            {invitations.length} {invitations.length === 1 ? 'invitation' : 'invitations'} total
            {pendingInvitations.length > 0 && (
              <> • {pendingInvitations.length} pending</>
            )}
          </Text>
        </View>
        <View direction="row" gap={2}>
          <select
            value={invitationsFilter}
            onChange={(e) => fetchInvitations(e.target.value as typeof invitationsFilter)}
            style={{
              padding: '6px 24px 6px 12px',
              borderRadius: '4px',
              border: '1px solid var(--rs-color-border-neutral)',
              backgroundColor: 'var(--rs-color-background-neutral)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {(['all', 'pending', 'accepted', 'expired', 'canceled', 'rejected'] as const).map(
              (status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              )
            )}
          </select>
          <Button
            variant="outline"
            icon={<Icon svg={<Plus weight="bold" />} size={4} />}
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            Invite User
          </Button>
        </View>
      </View>

      {showInviteForm && (
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
          <View direction="column" gap={2}>
            <Text variant="body-2" weight="medium">
              Send Invitation
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              The user will receive an invitation to join your organization
            </Text>
          </View>

          <View direction="column" gap={3}>
            <View direction="column" gap={1}>
              <Text variant="caption-1" weight="medium">
                Email Address
              </Text>
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="user@example.com"
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
                Role
              </Text>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'developer' | 'member')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--rs-color-border-neutral)',
                  backgroundColor: 'var(--rs-color-background-neutral)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {(['admin', 'developer', 'member'] as const).map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </View>

            <View direction="row" gap={2} justify="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowInviteForm(false)
                  setEmail('')
                  setRole('member')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvitation}
                disabled={isCreating || !email.trim()}
              >
                {isCreating ? 'Sending...' : 'Send Invitation'}
              </Button>
            </View>
          </View>
        </View>
      )}

      {invitationsLoading && invitations.length === 0 ? (
        <View align="center" padding={12}>
          <Text variant="body-1" color="neutral-faded">
            Loading invitations...
          </Text>
        </View>
      ) : invitationsError ? (
        <View direction="column" gap={4} padding={6}>
          <Text variant="body-1" color="critical">
            Error loading invitations: {invitationsError.message}
          </Text>
          <Button onClick={() => fetchInvitations(invitationsFilter)}>Try Again</Button>
        </View>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Email</Table.Cell>
              <Table.Cell>Role</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell>Invited By</Table.Cell>
              <Table.Cell>Expires</Table.Cell>
              <Table.Cell width="120px"></Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredInvitations.map((invitation) => {
              const isPending = invitation.status === 'pending'
              const isCanceling = cancelingId === invitation.id
              const isExpired = invitation.status === 'expired'
              const isCopying = copiedToken === invitation.token

              return (
                <Table.Row key={invitation.id}>
                  <Table.Cell>
                    <Text variant="body-2">{invitation.email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-2" color="neutral-faded">
                      {invitation.role}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-2" color="neutral-faded">
                      {invitation.invitedBy?.name || 'Unknown'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="body-2" color="neutral-faded">
                      {isExpired ? (
                        <View direction="row" gap={2} align="center">
                          <Icon svg={<XCircle weight="bold" />} size={4} color="neutral-faded" />
                          <span>Expired</span>
                        </View>
                      ) : (
                        new Date(invitation.expiresAt).toLocaleDateString()
                      )}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" gap={2}>
                      {isPending && invitation.token && (
                        <Button
                          variant="ghost"
                          size="small"
                          icon={
                            <Icon
                              svg={<Copy weight="bold" />}
                              size={4}
                            />
                          }
                          onClick={() => handleCopyInvitationLink(invitation.token!)}
                          attributes={{
                            'aria-label': isCopying ? 'Copied!' : 'Copy invitation link',
                            title: isCopying ? 'Copied!' : 'Copy invitation link',
                          }}
                        >
                          {isCopying ? 'Copied!' : 'Copy'}
                        </Button>
                      )}
                      {isPending && (
                        <Button
                          variant="ghost"
                          size="small"
                          color="critical"
                          icon={
                            <Icon svg={<Trash weight="bold" />} size={4} />
                          }
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={isCanceling}
                          attributes={{ 'aria-label': 'Cancel invitation' }}
                        />
                      )}
                    </View>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}

      {filteredInvitations.length === 0 && (
        <View align="center" padding={12}>
          <View direction="column" gap={3} align="center">
            <Icon svg={<EnvelopeSimple weight="bold" />} size={10} color="neutral-faded" />
            <Text variant="body-1" color="neutral-faded">
              No invitations found
            </Text>
            {!showInviteForm && (
              <Button
                variant="outline"
                icon={<Icon svg={<Plus weight="bold" />} size={4} />}
                onClick={() => setShowInviteForm(true)}
              >
                Send Invitation
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

