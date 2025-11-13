import { Text, View, Icon } from 'reshaped'
import { HandWavingIcon } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'

export interface PageHeaderProps {
  userName?: string
  subtitle?: string
  greeting?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function PageHeader({
  userName,
  subtitle = "Here's what's happening with your customer interactions today.",
  greeting
}: PageHeaderProps) {
  const { user } = useAuthStore()
  const displayName = userName || user?.name || 'User'
  const displayGreeting = greeting || getGreeting()

  return (
    <View direction="column" gap={2}>
      <View direction="row" gap={2} align="center">
        <Icon svg={<HandWavingIcon weight='fill' />} size={5} />
        <h3 style={{ margin: 0 }}>{displayGreeting}, {displayName.split(' ')[0]}!</h3>
      </View>
      <Text variant="body-2" color="neutral-faded">
        {subtitle}
      </Text>
    </View>
  )
}

