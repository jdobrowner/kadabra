import type React from 'react'
import { View } from 'reshaped'

export interface ContainerCardProps {
  children: React.ReactNode
  padding?: number
  backgroundColor?: string
  className?: string
  attributes?: React.HTMLAttributes<HTMLDivElement>
}

export function ContainerCard({
  children,
  padding = 6,
  backgroundColor,
  className,
  attributes
}: ContainerCardProps) {
  // Convert padding number to CSS value (Reshaped uses spacing scale)
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding
  
  // Use CSS variable for default, or provided backgroundColor
  const finalBackgroundColor = backgroundColor || 'var(--card-background-color, #fffdfe)'

  return (
    <View
      attributes={{
        ...attributes,
        style: {
          padding: paddingValue,
          backgroundColor: finalBackgroundColor,
          borderRadius: '30px',
          border: 'none',
          boxShadow: 'none',
          ...attributes?.style
        },
        className: className
      }}
    >
      {children}
    </View>
  )
}

