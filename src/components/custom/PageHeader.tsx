import { Text, View } from 'reshaped'
import { useAuthStore } from '../../store/useAuthStore'

export interface PageHeaderProps {
  title?: string
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
  title,
  userName,
  subtitle,
  greeting
}: PageHeaderProps) {
  const { user } = useAuthStore()
  const displayName = userName || user?.name || 'User'
  const displayGreeting = greeting || getGreeting()
  
  // If title is provided, use it. Otherwise, use greeting format
  const displayTitle = title || `${displayGreeting}, ${displayName.split(' ')[0]}!`
  const displaySubtitle = subtitle || (title ? undefined : "Here's what's happening with your customer interactions today.")

  return (
    <View direction="column" gap={2}>
      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, lineHeight: '1.2' }}>
        {displayTitle}
      </h1>
      {displaySubtitle && (
        <Text variant="body-1" color="neutral-faded" attributes={{ style: { fontSize: '18px' } }}>
          {displaySubtitle}
        </Text>
      )}
    </View>
  )
}

