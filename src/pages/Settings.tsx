import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Container, View, Text, Tabs } from 'reshaped'
import { Gear, Users, Envelope, Key, UsersThree, SquaresFour, GitBranch } from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import GeneralTab from '../components/settings/GeneralTab'
import UsersTab from '../components/settings/UsersTab'
import InvitationsTab from '../components/settings/InvitationsTab'
import ApiKeysTab from '../components/settings/ApiKeysTab'
import TeamsTab from '../components/settings/TeamsTab'
import RoutingRulesTab from '../components/settings/RoutingRulesTab'
import BoardsTab from '../components/settings/BoardsTab'

export default function Settings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const isDeveloperOrAdmin = user?.role === 'admin' || user?.role === 'developer'

  // Get tab from URL or default to 'general'
  const tabFromUrl = searchParams.get('tab') || 'general'
  const validTabs = isAdmin
    ? ['general', 'teams', 'routing', 'boards', 'users', 'invitations', 'api-keys']
    : isDeveloperOrAdmin
    ? ['general', 'api-keys']
    : ['general']
  const currentTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'general'

  // Redirect users from unauthorized tabs
  useEffect(() => {
    if (!isAdmin && (currentTab === 'users' || currentTab === 'invitations' || currentTab === 'teams' || currentTab === 'routing' || currentTab === 'boards')) {
      navigate('/settings?tab=general', { replace: true })
    }
    if (!isDeveloperOrAdmin && currentTab === 'api-keys') {
      navigate('/settings?tab=general', { replace: true })
    }
  }, [isAdmin, isDeveloperOrAdmin, currentTab, navigate])

  const handleTabChange = ({ value }: { value: string }) => {
    if (validTabs.includes(value)) {
      navigate(`/settings?tab=${value}`, { replace: true })
    }
  }

  return (
    <Container width="large">
      <View direction="column" gap={6}>
        <View direction="column" gap={2}>
          <Text variant="title-2" weight="bold">
            Settings
          </Text>
          <Text variant="body-2" color="neutral-faded">
            {isAdmin
              ? 'Manage your preferences and organization settings'
              : 'Manage your preferences'}
          </Text>
        </View>

        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Item value="general" icon={<Gear weight="bold" />}>
              General
            </Tabs.Item>
            {isAdmin && (
              <Tabs.Item value="teams" icon={<UsersThree weight="bold" />}>
                Teams
              </Tabs.Item>
            )}
            {isAdmin && (
              <Tabs.Item value="routing" icon={<GitBranch weight="bold" />}>
                Routing
              </Tabs.Item>
            )}
            {isAdmin && (
              <Tabs.Item value="boards" icon={<SquaresFour weight="bold" />}>
                Boards
              </Tabs.Item>
            )}
            {isDeveloperOrAdmin && (
              <Tabs.Item value="api-keys" icon={<Key weight="bold" />}>
                API Keys
              </Tabs.Item>
            )}
            {isAdmin && (
              <Tabs.Item value="users" icon={<Users weight="bold" />}>
                Users
              </Tabs.Item>
            )}
            {isAdmin && (
              <Tabs.Item value="invitations" icon={<Envelope weight="bold" />}>
                Invitations
              </Tabs.Item>
            )}
          </Tabs.List>

          <Tabs.Panel value="general">
            <GeneralTab />
          </Tabs.Panel>

          {isAdmin && (
            <Tabs.Panel value="teams">
              <TeamsTab />
            </Tabs.Panel>
          )}

          {isAdmin && (
            <Tabs.Panel value="routing">
              <RoutingRulesTab />
            </Tabs.Panel>
          )}

          {isAdmin && (
            <Tabs.Panel value="boards">
              <BoardsTab />
            </Tabs.Panel>
          )}

          {isDeveloperOrAdmin && (
            <Tabs.Panel value="api-keys">
              <ApiKeysTab />
            </Tabs.Panel>
          )}

          {isAdmin && (
            <Tabs.Panel value="users">
              <UsersTab />
            </Tabs.Panel>
          )}

          {isAdmin && (
            <Tabs.Panel value="invitations">
              <InvitationsTab />
            </Tabs.Panel>
          )}
        </Tabs>
      </View>
    </Container>
  )
}

