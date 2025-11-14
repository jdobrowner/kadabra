import { Text, View, Icon, Card } from 'reshaped'
import type React from 'react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

export interface MetricCardProps {
  value: string | number
  label: string
  secondaryLabel?: string
  icon?: PhosphorIcon
  iconColor?: string
  iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  backgroundColor?: string
  onClick?: () => void
}

export function MetricCard({ 
  value, 
  label,
  secondaryLabel,
  icon: IconComponent,
  iconColor,
  iconWeight = 'regular',
  backgroundColor,
  onClick 
}: MetricCardProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '0.9'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '1'
    }
  }

  return (
    <Card 
      padding={5}
      attributes={{
        onClick: onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        style: {
          backgroundColor: backgroundColor || 'var(--rs-color-background-neutral)',
          cursor: onClick ? 'pointer' : 'default',
          transition: onClick ? 'opacity 0.2s ease' : undefined
        }
      }}
    >
      <View direction="column" gap={secondaryLabel ? 2 : 4} align="center">
        <Text variant="featured-1" weight="bold">
          {value}
        </Text>
        <View direction="column" gap={0} align="center">
          <View direction="row" gap={2} align="center">
            {IconComponent && (
              <Icon 
                svg={<IconComponent weight={iconWeight} />} 
                size={4}
                attributes={{
                  style: {
                    color: iconColor || 'var(--rs-color-foreground-neutral)'
                  }
                }}
              />
            )}
            <Text 
              variant="body-2" 
              attributes={{
                style: {
                  textWrap: 'wrap'
                }
              }}
            >
              {label}
            </Text>
          </View>
          {secondaryLabel && (
            <Text variant="body-3" color="neutral-faded">
              {secondaryLabel}
            </Text>
          )}
        </View>
      </View>
    </Card>
  )
}

