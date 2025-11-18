import { Button } from 'reshaped'
import { useTheme } from 'reshaped'
import type { ButtonProps } from 'reshaped'
import type React from 'react'

export interface SecondaryButtonProps extends Omit<ButtonProps, 'variant' | 'attributes'> {
  children: React.ReactNode
  attributes?: React.HTMLAttributes<HTMLButtonElement>
}

export function SecondaryButton({ 
  children, 
  attributes,
  ...buttonProps 
}: SecondaryButtonProps) {
  const { colorMode } = useTheme()
  
  // Set colors based on theme mode
  const textColor = colorMode === 'dark' ? '#d8d4d4' : '#161515'
  const borderColor = colorMode === 'dark' ? '#b5b5b5' : '#706e6b'
  
  return (
    <Button
      {...buttonProps}
      variant="outline"
      attributes={{
        ...attributes,
        style: {
          ...attributes?.style,
          color: textColor,
          borderColor: borderColor,
          ['--rs-color-foreground-primary' as any]: textColor,
          ['--rs-button-foreground-color' as any]: textColor,
          ['--rs-button-border-color' as any]: borderColor,
          ['--rs-color-border-primary-faded' as any]: borderColor,
        } as React.CSSProperties,
      }}
    >
      {children}
    </Button>
  )
}

