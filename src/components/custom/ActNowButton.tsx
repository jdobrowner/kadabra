import type React from 'react'
import { Button } from 'reshaped'
import { Lightning } from '@phosphor-icons/react'
import './ActNowButton.css'

export interface ActNowButtonProps {
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  iconOnly?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function ActNowButton({
  children,
  onClick,
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  iconOnly = false,
  size = 'large'
}: ActNowButtonProps) {
  const displayChildren = iconOnly ? undefined : (children ?? 'Act Now')
  const buttonClassName = iconOnly 
    ? `act-now-button act-now-button-icon-only ${className}`.trim()
    : `act-now-button ${className}`.trim()

  return (
    <Button
      className={buttonClassName}
      onClick={onClick}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={loading}
      icon={<Lightning weight="fill" />}
      size={size}
    >
      {displayChildren}
    </Button>
  )
}

