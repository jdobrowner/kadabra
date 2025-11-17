import { View, Icon, Avatar, DropdownMenu, Text } from 'reshaped'
import { Moon, Sun, SignOut, ToggleLeft, ToggleRight } from '@phosphor-icons/react'
import { TodaysProgress } from './TodaysProgress'
import { useAuthStore } from '../../store/useAuthStore'
import { useTheme } from 'reshaped'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Header.css'
import { LOCAL_STORAGE_KEYS, setStoredValue, getStoredValue } from '../../utils/storage'

export interface HeaderProps {
  userAvatar?: string
  userName?: string
}

export function Header({ 
  userAvatar,
  userName
}: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { colorMode, setColorMode } = useTheme()
  const navigate = useNavigate()
  const isDark = colorMode === 'dark'
  const [demoMode, setDemoMode] = useState(() => getStoredValue<boolean>(LOCAL_STORAGE_KEYS.demoMode, false))
  
  const displayAvatar = userAvatar || user?.avatar
  const displayName = userName || user?.name

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  const handleToggleDemoMode = () => {
    const newValue = !demoMode
    setDemoMode(newValue)
    setStoredValue(LOCAL_STORAGE_KEYS.demoMode, newValue)
    // Reload the page to apply the change
    window.location.reload()
  }

  return (
    <>
      <header className="app-header">
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <linearGradient id="header-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5a77eb" />
              <stop offset="40%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <View 
          direction="row" 
          gap={4} 
          align="center"
          attributes={{ 
            style: { 
              width: '100%',
              justifyContent: 'flex-end',
              padding: '2px 16px',
              height: 'var(--header-height)',
            } 
          }}
        >
        <View direction="row" gap={8} align="center" attributes={{ style: { minWidth: 0, flexShrink: 0 } }}>
          <TodaysProgress />
          {displayAvatar && (
            <DropdownMenu position="bottom-end" fallbackPositions={['bottom', 'top-end', 'top']}>
              <DropdownMenu.Trigger>
                {(attributes) => (
                  <button
                    {...attributes}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                    }}
                    aria-label="User menu"
                  >
                    <Avatar src={displayAvatar} alt={displayName || 'User'} size={9} />
                  </button>
                )}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                attributes={{
                  style: {
                    boxShadow: 'none',
                    borderRadius: '16px',
                    border: '1px solid var(--rs-color-border-neutral)',
                    backgroundColor: 'var(--rs-color-background-neutral)',
                  },
                  className: 'styled-dropdown-content',
                }}
              >
                <DropdownMenu.Item
                  onClick={() => {
                    const nextMode = isDark ? 'light' : 'dark'
                    setColorMode(nextMode)
                    setStoredValue(LOCAL_STORAGE_KEYS.colorMode, nextMode)
                  }}
                >
                  <View direction="row" gap={2} align="center">
                    <Icon
                      svg={isDark ? <Sun weight="bold" /> : <Moon weight="bold" />}
                      size={5}
                    />
                    <Text>
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </Text>
                  </View>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={handleToggleDemoMode}>
                  <View direction="row" gap={2} align="center" attributes={{ style: { justifyContent: 'space-between', width: '100%' } }}>
                    <View direction="row" gap={2} align="center">
                      <Icon
                        svg={demoMode ? <ToggleRight weight="fill" /> : <ToggleLeft weight="fill" />}
                        size={5}
                        color={demoMode ? 'primary' : 'neutral-faded'}
                      />
                      <Text>Demo Mode</Text>
                    </View>
                    {demoMode && (
                      <Text variant="caption-1" color="primary">
                        ON
                      </Text>
                    )}
                  </View>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={handleLogout}>
                  <View direction="row" gap={2} align="center">
                    <Icon svg={<SignOut weight="bold" />} size={5} />
                    <Text>Sign Out</Text>
                  </View>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </View>
      </View>
      </header>
      {/* Extended gradient background - positioned below header, above main content */}
      <div 
        className="header-gradient-extension"
      />
    </>
  )
}
