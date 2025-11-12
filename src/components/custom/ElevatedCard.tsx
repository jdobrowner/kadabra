import type React from 'react'
import { View } from 'reshaped'

export interface ElevatedCardProps {
  children: React.ReactNode
  padding?: number
  onClick?: () => void
  className?: string
  attributes?: React.HTMLAttributes<HTMLDivElement>
}

export function ElevatedCard({
  children,
  padding = 5,
  onClick,
  className,
  attributes
}: ElevatedCardProps) {
  // Convert padding number to CSS value (Reshaped uses spacing scale)
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding

  const baseStyle: React.CSSProperties = {
    padding: paddingValue,
    backgroundColor: 'var(--rs-color-background-neutral)',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...attributes?.style
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
    attributes?.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
    attributes?.onMouseLeave?.(e)
  }

  return (
    <View
      attributes={{
        ...attributes,
        style: baseStyle,
        onClick: onClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: className
      }}
    >
      {children}
    </View>
  )
}

