import { useEffect, useState } from 'react'
import { View, Text, Button, Table, Icon } from 'reshaped'
import { Key, Trash, Plus, Copy, Check } from '@phosphor-icons/react'
import { useApiKeysStore } from '../../store/useApiKeysStore'

export default function ApiKeysTab() {
  const apiKeys = useApiKeysStore((state) => state.apiKeys)
  const apiKeysLoading = useApiKeysStore((state) => state.apiKeysLoading)
  const apiKeysError = useApiKeysStore((state) => state.apiKeysError)
  const fetchApiKeys = useApiKeysStore((state) => state.fetchApiKeys)
  const createApiKey = useApiKeysStore((state) => state.createApiKey)
  const deleteApiKey = useApiKeysStore((state) => state.deleteApiKey)
  const revealApiKey = useApiKeysStore((state) => state.revealApiKey)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<{ key: string; name: string } | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
  const [revealingKeyId, setRevealingKeyId] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key')
      return
    }

    setCreating(true)
    try {
      const result = await createApiKey(
        newKeyName.trim(),
        newKeyExpiresAt || undefined
      )
      setCreatedKey({ key: result.key, name: result.name })
      setNewKeyName('')
      setNewKeyExpiresAt('')
      setShowCreateForm(false)
      // Refresh the list to get the masked key
      await fetchApiKeys()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKeyId(key)
      setTimeout(() => setCopiedKeyId(null), 2000)
    } catch {
      alert('Failed to copy to clipboard')
    }
  }

  const handleCopyRevealedKey = async (keyId: string) => {
    if (revealingKeyId) return // Already revealing
    
    setRevealingKeyId(keyId)
    try {
      const fullKey = await revealApiKey(keyId)
      await navigator.clipboard.writeText(fullKey)
      setCopiedKeyId(keyId)
      setTimeout(() => {
        setCopiedKeyId(null)
        setRevealingKeyId(null)
      }, 2000)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reveal and copy API key')
      setRevealingKeyId(null)
    }
  }

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingKeyId(keyId)
    try {
      await deleteApiKey(keyId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete API key')
    } finally {
      setDeletingKeyId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (apiKeysLoading) {
    return (
      <View direction="column" gap={4}>
        <Text>Loading API keys...</Text>
      </View>
    )
  }

  if (apiKeysError) {
    return (
      <View direction="column" gap={4}>
        <Text variant="body-2" color="critical">
          Error loading API keys: {apiKeysError.message}
        </Text>
        <Button onClick={fetchApiKeys}>Retry</Button>
      </View>
    )
  }

  return (
    <View direction="column" gap={6}>
      {/* New Key Created Modal */}
      {createdKey && (
        <View
          direction="column"
          gap={4}
          padding={4}
          attributes={{
            style: {
              border: '2px solid var(--rs-color-border-primary)',
              borderRadius: '8px',
              backgroundColor: 'var(--rs-color-primary-background)',
            },
          }}
        >
          <View direction="row" justify="space-between" align="center">
            <View direction="column" gap={1}>
              <Text variant="body-1" weight="bold">
                API Key Created Successfully
              </Text>
              <Text variant="caption-1" color="neutral-faded">
                Save this key now - you won't be able to see it again!
              </Text>
            </View>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setCreatedKey(null)}
            >
              Close
            </Button>
          </View>
          
          <View
            direction="column"
            gap={2}
            padding={3}
            attributes={{
              style: {
                backgroundColor: 'var(--rs-color-background-neutral)',
                borderRadius: '4px',
                fontFamily: 'monospace',
              },
            }}
          >
            <View direction="row" justify="space-between" align="center">
              <Text variant="caption-1" weight="medium">
                {createdKey.name}
              </Text>
              <Button
                variant="ghost"
                size="small"
                icon={
                  copiedKeyId === createdKey.key ? (
                    <Icon svg={<Check weight="bold" />} size={4} />
                  ) : (
                    <Icon svg={<Copy weight="bold" />} size={4} />
                  )
                }
                onClick={() => handleCopyKey(createdKey.key)}
              >
                {copiedKeyId === createdKey.key ? 'Copied!' : 'Copy'}
              </Button>
            </View>
            <Text
              variant="body-2"
              attributes={{
                style: {
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                },
              }}
            >
              {createdKey.key}
            </Text>
          </View>
        </View>
      )}

      {/* Create New Key Section */}
      <View direction="column" gap={4}>
        <View direction="row" justify="space-between" align="center">
          <View direction="column" gap={1}>
            <Text variant="body-1" weight="medium">
              API Keys
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              Manage API keys for integrations. Keys are scoped to your organization.
            </Text>
          </View>
          {!showCreateForm && (
            <Button
              icon={<Icon svg={<Plus weight="bold" />} size={4} />}
              onClick={() => setShowCreateForm(true)}
            >
              Create API Key
            </Button>
          )}
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
            <Text variant="body-2" weight="medium">
              Create New API Key
            </Text>
            <View direction="column" gap={3}>
              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Name *
                </Text>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Integration"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--rs-color-border-neutral)',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </View>
              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Expires At (Optional)
                </Text>
                <input
                  type="datetime-local"
                  value={newKeyExpiresAt}
                  onChange={(e) => setNewKeyExpiresAt(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--rs-color-border-neutral)',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </View>
            </View>
            <View direction="row" gap={2} justify="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewKeyName('')
                  setNewKeyExpiresAt('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={creating || !newKeyName.trim()}>
                {creating ? 'Creating...' : 'Create Key'}
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* API Keys Table */}
      {apiKeys.length === 0 ? (
        <View
          direction="column"
          gap={3}
          align="center"
          padding={6}
          attributes={{
            style: {
              border: '1px dashed var(--rs-color-border-neutral)',
              borderRadius: '8px',
            },
          }}
        >
          <Icon svg={<Key weight="regular" />} size={8} color="neutral-faded" />
          <Text variant="body-2" color="neutral-faded" align="center">
            No API keys yet. Create one to get started.
          </Text>
        </View>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>API Key</Table.Cell>
              <Table.Cell>Created</Table.Cell>
              <Table.Cell>Last Used</Table.Cell>
              <Table.Cell>Expires</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell>Actions</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {apiKeys.map((key) => {
              const expired = isExpired(key.expiresAt)
              const isCopying = revealingKeyId === key.id || copiedKeyId === key.id
              return (
                <Table.Row key={key.id}>
                  <Table.Cell>
                    <Text variant="body-2" weight="medium">
                      {key.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <View direction="row" align="center" gap={2}>
                      <Text
                        variant="caption-1"
                        attributes={{
                          style: {
                            fontFamily: 'monospace',
                            color: 'var(--rs-color-text-neutral)',
                          },
                        }}
                      >
                        {key.keyMasked || '••••••••'}
                      </Text>
                      <Button
                        variant="ghost"
                        size="small"
                        icon={
                          <Icon
                            svg={
                              isCopying ? (
                                <Check weight="bold" />
                              ) : (
                                <Copy weight="bold" />
                              )
                            }
                            size={3}
                          />
                        }
                        onClick={() => handleCopyRevealedKey(key.id)}
                        disabled={isCopying || revealingKeyId === key.id || key.hasEncryptedKey === false}
                        attributes={{
                          style: {
                            minWidth: 'auto',
                            padding: '4px',
                          },
                          title:
                            key.hasEncryptedKey === false
                              ? 'Key cannot be revealed (created before encryption was enabled). Please create a new key.'
                              : 'Copy API key',
                        }}
                      />
                    </View>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="caption-1" color="neutral-faded">
                      {formatDate(key.createdAt)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="caption-1" color="neutral-faded">
                      {formatDate(key.lastUsedAt)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text variant="caption-1" color="neutral-faded">
                      {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <View
                      attributes={{
                        style: {
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: expired
                            ? 'var(--rs-color-critical-background)'
                            : 'var(--rs-color-positive-background)',
                          color: expired
                            ? 'var(--rs-color-critical)'
                            : 'var(--rs-color-positive)',
                          fontSize: '12px',
                          fontWeight: 500,
                        },
                      }}
                    >
                      {expired ? 'Expired' : 'Active'}
                    </View>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<Icon svg={<Trash weight="bold" />} size={4} />}
                      onClick={() => handleDeleteKey(key.id, key.name)}
                      disabled={deletingKeyId === key.id}
                    >
                      {deletingKeyId === key.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}
    </View>
  )
}

