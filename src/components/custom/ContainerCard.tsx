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
  backgroundColor = '#ffffff',
  className,
  attributes
}: ContainerCardProps) {
  // Convert padding number to CSS value (Reshaped uses spacing scale)
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding

  return (
    <View
      attributes={{
        ...attributes,
        style: {
          padding: paddingValue,
          backgroundColor: backgroundColor,
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

