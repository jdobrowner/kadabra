import type React from 'react'
import { View } from 'reshaped'

export interface ContainerCardProps {
  children: React.ReactNode
  padding?: number
  backgroundColor?: string
  borderColor?: string
  className?: string
  attributes?: React.HTMLAttributes<HTMLDivElement>
}

// Helper function to calculate a slightly darker border color from a background color
function getBorderColor(backgroundColor?: string): string {
  if (!backgroundColor) {
    return 'var(--rs-color-border-neutral)' // Use Reshaped theme token
  }
  
  // If it's a CSS variable or the default whiteish color, use the Reshaped border token
  // Reshaped tokens automatically handle light/dark mode
  if (backgroundColor.includes('var(') || backgroundColor === '#fffdfe' || backgroundColor === 'var(--rs-color-background-neutral)' || backgroundColor === 'var(--card-background-color, #fffdfe)') {
    return 'var(--rs-color-border-neutral)'
  }
  
  // For dark mode card color, use Reshaped dark mode border token
  if (backgroundColor === '#1c1c1c') {
    return 'var(--rs-color-border-neutral)' // Reshaped handles dark mode automatically
  }
  
  // Parse rgba color and darken it slightly
  const rgbaMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    
    // Darken by reducing RGB values by ~8-10%
    const darkenFactor = 0.92
    const darkerR = Math.max(0, Math.floor(r * darkenFactor))
    const darkerG = Math.max(0, Math.floor(g * darkenFactor))
    const darkerB = Math.max(0, Math.floor(b * darkenFactor))
    
    return `rgba(${darkerR}, ${darkerG}, ${darkerB}, ${alpha})`
  }
  
  // Fallback for hex colors - use Reshaped token
  if (backgroundColor.startsWith('#')) {
    return 'var(--rs-color-border-neutral)' // Use Reshaped theme token
  }
  
  return 'var(--rs-color-border-neutral)' // Default border using Reshaped theme token
}

export function ContainerCard({
  children,
  padding = 6,
  backgroundColor,
  borderColor,
  className,
  attributes
}: ContainerCardProps) {
  // Convert padding number to CSS value (Reshaped uses spacing scale)
  const paddingValue = typeof padding === 'number' ? `${padding * 4}px` : padding
  
  // Use Reshaped theme token for default, or provided backgroundColor
  const finalBackgroundColor = backgroundColor || 'var(--rs-color-background-neutral)'
  
  // Calculate border color if not provided
  // CSS variable will automatically handle light/dark mode
  const finalBorderColor = borderColor || getBorderColor(finalBackgroundColor)

  return (
    <View
      attributes={{
        ...attributes,
        style: {
          padding: paddingValue,
          backgroundColor: finalBackgroundColor,
          borderRadius: '30px',
          border: `1px solid ${finalBorderColor}`,
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

