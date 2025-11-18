import { Button } from 'reshaped'
import { useTheme } from 'reshaped'
import type { ButtonProps } from 'reshaped'
import type React from 'react'
import { useEffect, useRef } from 'react'

export interface CustomButtonProps extends Omit<ButtonProps, 'attributes'> {
  children: React.ReactNode
  attributes?: React.HTMLAttributes<HTMLButtonElement>
}

export function CustomButton({ 
  children, 
  attributes,
  variant = 'solid',
  ...buttonProps 
}: CustomButtonProps) {
  const { colorMode } = useTheme()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  
  // Determine font weight based on variant
  // Solid buttons: 700, Outline and Ghost buttons: 600
  const fontWeight = variant === 'solid' ? '700' : '600'
  
  // Determine font size based on size prop
  // Small buttons: 14px, Regular buttons: 16px
  const fontSize = buttonProps.size === 'small' ? '14px' : '16px'
  
  // Set colors for outline buttons based on theme mode
  const textColor = variant === 'outline' 
    ? (colorMode === 'dark' ? '#d8d4d4' : '#161515')
    : undefined
  const borderColor = variant === 'outline'
    ? (colorMode === 'dark' ? '#b5b5b5' : '#706e6b')
    : undefined
  
  // Apply font-weight and font-size to nested text spans after render
  // Also apply icon size if provided via iconSize prop
  useEffect(() => {
    const applyStyles = () => {
      if (buttonRef.current) {
        const textSpans = buttonRef.current.querySelectorAll('[class*="_text_"]')
        textSpans.forEach((span) => {
          const element = span as HTMLElement
          element.style.fontWeight = fontWeight
          element.style.fontSize = fontSize
        })
        
        // Apply icon size if data-icon-size is provided in attributes
        const iconSize = buttonRef.current.getAttribute('data-icon-size')
        if (iconSize) {
          const svgElements = buttonRef.current.querySelectorAll('svg')
          svgElements.forEach((svg) => {
            svg.style.width = iconSize
            svg.style.height = iconSize
          })
        }
      }
    }
    
    // Apply immediately
    applyStyles()
    
    // Also apply after a short delay to catch dynamically rendered spans
    const timeout = setTimeout(applyStyles, 0)
    
    return () => clearTimeout(timeout)
  }, [fontWeight, fontSize, children, attributes])
  
  // Build style object
  const style: React.CSSProperties = {
    fontWeight: fontWeight,
    fontSize: fontSize,
    ['--rs-font-weight-bold' as any]: fontWeight,
    ...(attributes?.style || {}),
    ...(variant === 'outline' && textColor && borderColor ? {
      color: textColor,
      borderColor: borderColor,
      ['--rs-color-foreground-primary' as any]: textColor,
      ['--rs-button-foreground-color' as any]: textColor,
      ['--rs-button-border-color' as any]: borderColor,
      ['--rs-color-border-primary-faded' as any]: borderColor,
    } : {}),
  }
  
  return (
    <Button
      {...buttonProps}
      variant={variant}
      attributes={{
        ...attributes,
        ref: (node: HTMLButtonElement | null) => {
          buttonRef.current = node
        },
        style,
      }}
    >
      {children}
    </Button>
  )
}

