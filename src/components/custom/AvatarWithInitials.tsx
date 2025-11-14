import { Text, View } from 'reshaped'
import { useState } from 'react'

export interface AvatarWithInitialsProps {
  src?: string
  alt: string
  name: string
  size?: number | string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getAvatarColor(name: string): string {
  // Generate a consistent color based on the name
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
    '#06b6d4', // cyan
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getSizeInPixels(size: number | string | undefined): string {
  if (typeof size === 'number') {
    // Reshaped size tokens are multiples of 4px, size 14 = 56px, size 10 = 40px, size 12 = 48px
    return `${size * 4}px`
  }
  if (typeof size === 'string') {
    return size
  }
  return '56px' // default
}

export function AvatarWithInitials({ src, alt, name, size }: AvatarWithInitialsProps) {
  const [avatarError, setAvatarError] = useState(false)
  const initials = getInitials(name)
  const avatarBgColor = getAvatarColor(name)
  const sizePx = getSizeInPixels(size)

  if (avatarError || !src) {
    return (
      <View
        attributes={{
          style: {
            width: sizePx,
            height: sizePx,
            borderRadius: '50%',
            backgroundColor: avatarBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }
        }}
      >
        <Text variant="body-1" weight="bold" attributes={{ style: { color: '#f2efef' } }}>
          {initials}
        </Text>
      </View>
    )
  }

  return (
    <View
      attributes={{
        style: {
          width: sizePx,
          height: sizePx,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setAvatarError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </View>
  )
}

