import { Icon } from 'reshaped'
import { Sparkle } from '@phosphor-icons/react'
import './Loading.css'

interface LoadingProps {
  size?: number
  className?: string
}

export function Loading({ size = 8, className }: LoadingProps) {
  return (
    <div className={`loading-container ${className || ''}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="loading-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5a77eb" />
            <stop offset="40%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="loading-icon-wrapper">
        <Icon svg={<Sparkle weight="fill" />} size={size} />
      </div>
    </div>
  )
}

