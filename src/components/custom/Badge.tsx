import { forwardRef } from 'react'
import type React from 'react'
import { Badge } from 'reshaped'
import type { Icon } from '@phosphor-icons/react'
import { 
  DotOutlineIcon, 
  WarningCircle, 
  TrendUp, 
  UserCirclePlusIcon, 
  ClockCounterClockwise 
} from '@phosphor-icons/react'
import './Badge.css'

export type BadgeType = 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'

export interface BadgeProps {
  children: React.ReactNode
  icon?: Icon
  badgeType?: BadgeType
  color?: 'primary' | 'critical' | 'positive' | 'warning' | 'neutral'
  size?: 'small' | 'medium' | 'large'
}

function getBadgeIcon(badgeType?: BadgeType): Icon {
  switch (badgeType) {
    case 'at-risk':
      return WarningCircle
    case 'opportunity':
      return TrendUp
    case 'lead':
      return UserCirclePlusIcon
    case 'follow-up':
      return ClockCounterClockwise
    default:
      return DotOutlineIcon
  }
}

export function CustomBadge({ 
  children, 
  icon: IconComponent,
  badgeType,
  color = 'neutral',
  size = 'medium'
}: BadgeProps) {
  // Use badge-specific icon if badgeType is provided, otherwise use provided icon or default
  const FinalIcon = IconComponent || getBadgeIcon(badgeType)
  
  // Create a wrapper component that renders the icon with bold weight
  const BoldIcon = forwardRef<SVGSVGElement>((props, ref) => (
    <FinalIcon weight="bold" {...props} ref={ref} />
  ))
  BoldIcon.displayName = 'BoldIcon'
  
  return (
    <Badge
      className="custom-badge"
      color={color}
      variant="outline"
      rounded
      size={size}
      icon={size === 'small' ? undefined : BoldIcon}
      attributes={{ 'data-size': size }}
    >
      {children}
    </Badge>
  )
}
