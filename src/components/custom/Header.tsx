import { View, Icon, Avatar, DropdownMenu, Text } from 'reshaped'
import { Sparkle, Moon, Sun, SignOut } from '@phosphor-icons/react'
import { TodaysProgress } from './TodaysProgress'
import { useAuthStore } from '../../store/useAuthStore'
import { useTheme } from 'reshaped'
import { useNavigate } from 'react-router-dom'
import './Header.css'
import { LOCAL_STORAGE_KEYS, setStoredValue } from '../../utils/storage'

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
  
  const displayAvatar = userAvatar || user?.avatar
  const displayName = userName || user?.name

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
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
            justifyContent: 'space-between',
            padding: '2px 16px',
            height: 'var(--header-height)',
          } 
        }}
      >
        <View direction="row" gap={3} align="center">
          <div className="header-icon">
            <Icon svg={<Sparkle weight="fill" />} size={6} />
          </div>
          <h1 className="header-title">KADABRA</h1>
        </View>
        <View direction="row" gap={6} align="center" attributes={{ style: { minWidth: 0, flexShrink: 0 } }}>
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
              <DropdownMenu.Content>
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
  )
}
