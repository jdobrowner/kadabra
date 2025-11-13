import type React from 'react'
import { View } from 'reshaped'

export interface RowCardProps {
  children: React.ReactNode
  padding?: number
  noBorderBottom?: boolean
  onClick?: () => void
  className?: string
  attributes?: React.HTMLAttributes<HTMLDivElement>
}

export function RowCard({
  children,
  padding = 4,
  noBorderBottom = false,
  onClick,
  className,
  attributes
}: RowCardProps) {
  // Convert padding number to CSS value (Reshaped uses spacing scale)
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding

  const baseStyle: React.CSSProperties = {
    paddingTop: paddingValue,
    paddingBottom: paddingValue,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    borderBottom: noBorderBottom ? 'none' : `1px solid var(--row-card-border-color)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: onClick ? 'opacity 0.2s ease' : undefined,
    ...attributes?.style
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick()
    }
    attributes?.onClick?.(e)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '0.8'
    }
    attributes?.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '1'
    }
    attributes?.onMouseLeave?.(e)
  }

  return (
    <View
      attributes={{
        ...attributes,
        style: baseStyle,
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: className
      }}
    >
      {children}
    </View>
  )
}

