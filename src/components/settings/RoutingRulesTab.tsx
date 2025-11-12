import { useEffect, useMemo, useState } from 'react'
import { View, Text, Button, Table, Icon } from 'reshaped'
import { Plus } from '@phosphor-icons/react'
import { useRoutingRulesStore } from '../../store/useRoutingRulesStore'
import { useTeamsStore } from '../../store/useTeamsStore'
import { useBoardsStore } from '../../store/useBoardsStore'
import { trpcVanillaClient } from '../../lib/trpc-client'

export default function RoutingRulesTab() {
  const routingRules = useRoutingRulesStore((state) => state.routingRules)
  const routingRulesLoading = useRoutingRulesStore((state) => state.routingRulesLoading)
  const routingRulesError = useRoutingRulesStore((state) => state.routingRulesError)
  const fetchRoutingRules = useRoutingRulesStore((state) => state.fetchRoutingRules)
  const createRoutingRule = useRoutingRulesStore((state) => state.createRoutingRule)
  const updateRoutingRule = useRoutingRulesStore((state) => state.updateRoutingRule)
  const deleteRoutingRule = useRoutingRulesStore((state) => state.deleteRoutingRule)
  const reorderRoutingRules = useRoutingRulesStore((state) => state.reorderRoutingRules)

  const teams = useTeamsStore((state) => state.teams)
  const fetchTeams = useTeamsStore((state) => state.fetchTeams)
  const boards = useBoardsStore((state) => state.boards)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<string>('')
  const [conditionType, setConditionType] = useState<'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom'>('badge')
  const [conditionValue, setConditionValue] = useState('')
  const [targetTeamId, setTargetTeamId] = useState('')
  const [targetBoardId, setTargetBoardId] = useState('')
  const [targetColumnId, setTargetColumnId] = useState('')
  const [availableColumns, setAvailableColumns] = useState<Array<{ id: string; name: string }>>([])
  const [creatingRule, setCreatingRule] = useState(false)

  useEffect(() => {
    fetchRoutingRules()
    fetchTeams()
    fetchBoards()
  }, [fetchRoutingRules, fetchTeams, fetchBoards])

  useEffect(() => {
    const loadColumns = async () => {
      if (!targetBoardId) {
        setAvailableColumns([])
        return
      }
      try {
        const detail = await trpcVanillaClient.boards.detail.query({ id: targetBoardId })
        setAvailableColumns(detail.columns.map((column) => ({ id: column.id, name: column.name })))
      } catch {
        setAvailableColumns([])
      }
    }
    loadColumns()
  }, [targetBoardId])

  useEffect(() => {
    setTargetColumnId('')
  }, [targetBoardId])

  const sortedRules = useMemo(() => routingRules.slice().sort((a, b) => a.priority - b.priority), [routingRules])

  const handleCreateRule = async () => {
    if (!name.trim()) {
      alert('Rule name is required')
      return
    }
    if (!targetTeamId) {
      alert('Select a target team')
      return
    }
    setCreatingRule(true)
    try {
      await createRoutingRule({
        name: name.trim(),
        channel: channel.trim()
          ? (channel.trim() as 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message')
          : null,
        conditionType,
        conditionValue: conditionValue.trim() ? conditionValue.trim() : null,
        targetTeamId,
        targetBoardId: targetBoardId || null,
        targetColumnId: targetColumnId || null,
      })
      setName('')
      setChannel('')
      setConditionValue('')
      setTargetTeamId('')
      setTargetBoardId('')
      setTargetColumnId('')
      setShowCreateForm(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create routing rule')
    } finally {
      setCreatingRule(false)
    }
  }

  const handleToggleEnabled = async (ruleId: string, enabled: boolean) => {
    await updateRoutingRule({ id: ruleId, enabled: !enabled })
  }

  const handleRenameRule = async (ruleId: string, currentName: string) => {
    const next = prompt('Rename routing rule', currentName)
    if (!next || !next.trim()) {
      return
    }
    await updateRoutingRule({ id: ruleId, name: next.trim() })
  }

  const handleReorderRule = async (ruleId: string, direction: 'up' | 'down') => {
    const index = sortedRules.findIndex((rule) => rule.id === ruleId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedRules.length) return
    const reordered = [...sortedRules]
    const [moving] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moving)
    await reorderRoutingRules(reordered.map((rule) => rule.id))
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this routing rule?')) {
      return
    }
    await deleteRoutingRule(id)
  }

  return (
    <View direction="column" gap={6}>
      <View direction="column" gap={3}>
        <View direction="row" justify="space-between" align="center">
          <View direction="column" gap={1}>
            <Text variant="body-1" weight="medium">
              Routing rules
            </Text>
            <Text variant="body-2" color="neutral-faded">
              Automatically assign action plans based on AI signals
            </Text>
          </View>
          <Button
            variant="outline"
            icon={<Icon svg={<Plus weight="bold" />} size={4} />}
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? 'Cancel' : 'New Rule'}
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
                  Rule name
                </Text>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. At-risk customers"
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
                    Condition type
                  </Text>
                  <select
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as typeof conditionType)}
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
                    <option value="badge">Customer badge</option>
                    <option value="intent">Intent</option>
                    <option value="urgency">Urgency</option>
                    <option value="customer_segment">Customer segment</option>
                    <option value="channel">Channel</option>
                    <option value="custom">Custom</option>
                  </select>
                </View>
                <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
                  <Text variant="caption-1" weight="medium">
                    Condition value
                  </Text>
                  <input
                    type="text"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="e.g. at-risk"
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
              </View>

              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Channel (optional)
                </Text>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
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
                  <option value="">Any channel</option>
                  {['phone', 'email', 'chat', 'video', 'sms', 'ai-call', 'voice-message'].map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </View>

              <View direction="column" gap={1}>
                <Text variant="caption-1" weight="medium">
                  Target team
                </Text>
                <select
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
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
                  <option value="">Select team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </View>

              <View direction="row" gap={3}>
                <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
                  <Text variant="caption-1" weight="medium">
                    Target board (optional)
                  </Text>
                  <select
                    value={targetBoardId}
                    onChange={(e) => setTargetBoardId(e.target.value)}
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
                    <option value="">Use routing defaults</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </View>
                <View direction="column" gap={1} attributes={{ style: { flex: 1 } }}>
                  <Text variant="caption-1" weight="medium">
                    Target column (optional)
                  </Text>
                  <select
                    value={targetColumnId}
                    onChange={(e) => setTargetColumnId(e.target.value)}
                    disabled={!targetBoardId || availableColumns.length === 0}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--rs-color-border-neutral)',
                      backgroundColor: 'var(--rs-color-background-neutral)',
                      fontSize: '14px',
                      cursor: targetBoardId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <option value="">Use board default</option>
                    {availableColumns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </View>
              </View>

              <View direction="row" justify="end" gap={2}>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule} disabled={creatingRule || !name.trim() || !targetTeamId}>
                  {creatingRule ? 'Creating...' : 'Create Rule'}
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>

      {routingRulesLoading && routingRules.length === 0 ? (
        <View align="center" padding={12}>
          <Text variant="body-1" color="neutral-faded">
            Loading routing rules...
          </Text>
        </View>
      ) : routingRulesError ? (
        <View direction="column" gap={4} padding={6}>
          <Text variant="body-1" color="critical">
            Error loading routing rules: {routingRulesError.message}
          </Text>
          <Button onClick={fetchRoutingRules}>Try Again</Button>
        </View>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Condition</Table.Cell>
              <Table.Cell>Target</Table.Cell>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell width="220px"></Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sortedRules.map((rule, index) => (
              <Table.Row key={rule.id}>
                <Table.Cell>
                  <Text variant="body-2" weight="medium">
                    {rule.name}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <View direction="column" gap={1}>
                    <Text variant="body-2" color="neutral-faded">
                      {rule.conditionType}
                    </Text>
                    {rule.conditionValue && (
                      <Text variant="caption-1" color="neutral-faded">
                        {rule.conditionValue}
                      </Text>
                    )}
                    {rule.channel && (
                      <Text variant="caption-1" color="neutral-faded">
                        Channel: {rule.channel}
                      </Text>
                    )}
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <View direction="column" gap={1}>
                    <Text variant="body-2">{rule.targetTeam?.name ?? 'Team'}</Text>
                    {rule.targetBoard && (
                      <Text variant="caption-1" color="neutral-faded">
                        {rule.targetBoard.name}
                        {rule.targetColumn ? ` → ${rule.targetColumn.name}` : ''}
                      </Text>
                    )}
                  </View>
                </Table.Cell>
                <Table.Cell>
                  <Text variant="body-2" color={rule.enabled ? 'positive' : 'neutral-faded'}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <View direction="row" gap={2} justify="end">
                    <Button variant="ghost" size="small" onClick={() => handleToggleEnabled(rule.id, rule.enabled)}>
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => handleRenameRule(rule.id, rule.name)}>
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleReorderRule(rule.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleReorderRule(rule.id, 'down')}
                      disabled={index === sortedRules.length - 1}
                    >
                      ↓
                    </Button>
                    <Button variant="ghost" size="small" color="critical" onClick={() => handleDeleteRule(rule.id)}>
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
  )
}
