import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { View, Text, Button } from 'reshaped'
import {
  SquaresFour,
  Lightning,
  Gear,
  SidebarSimple,
  ListMagnifyingGlass,
  ChalkboardSimple,
  Alarm,
  Bell,
  Upload,
  Sparkle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import './Sidebar.css'

interface NavItem {
  path: string
  icon: React.ReactElement
  label: string
}

interface SidebarNavButtonProps {
  icon: React.ReactElement
  label: string
  isOpen: boolean
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void
  ariaLabel: string
}

function SidebarNavButton({ icon, label, isOpen, isActive, onClick, ariaLabel }: SidebarNavButtonProps) {
  return (
    <Button
      size="large"
      variant={isActive ? 'solid' : 'ghost'}
      onClick={onClick}
      attributes={{
        'aria-label': ariaLabel,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 0,
          gap: '0 !important'
        },
      }}
    >
      {/* Fixed width icon container */}
      <View
        attributes={{
          style: {
            width: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          },
        }}
      >
        {icon}
      </View>
      {/* Text to the right when sidebar is open */}
      {isOpen && (
        <Text
          variant="body-2"
          weight="medium"
          attributes={{
            style: {
              fontSize: '16px',
              marginLeft: '-8px'
            },
          }}
        >
          {label}
        </Text>
      )}
    </Button>
  )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [hasRendered, setHasRendered] = useState(false)
  const [showPanelToggle, setShowPanelToggle] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const isDeveloperOrAdmin = user?.role === 'admin' || user?.role === 'developer'

  // Mark as rendered after initial mount to enable transitions
  useEffect(() => {
    setHasRendered(true)
  }, [])

  // Control panel toggle fade-in timing
  useEffect(() => {
    if (isOpen && hasRendered) {
      // Delay showing the toggle button to match sidebar opening animation
      const timer = setTimeout(() => {
        setShowPanelToggle(true)
      }, 100) // Start fade-in 0.1s after sidebar starts opening (sidebar takes 0.3s total)
      return () => clearTimeout(timer)
    } else {
      setShowPanelToggle(false)
    }
  }, [isOpen, hasRendered])

  const navItems: NavItem[] = [
    { path: '/triage', icon: <Lightning weight="bold" size={20} />, label: 'Triage' },
    { path: '/search', icon: <ListMagnifyingGlass weight="bold" size={20} />, label: 'Search' },
    { path: '/boards', icon: <ChalkboardSimple weight="bold" size={20} />, label: 'Boards' },
    { path: '/reminders', icon: <Alarm weight="bold" size={20} />, label: 'Reminders' },
    ...(isDeveloperOrAdmin
      ? [{ path: '/import-data', icon: <Upload weight="bold" size={20} />, label: 'Import' }]
      : []
    ),
  ]

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const handleSidebarClick = (e: React.MouseEvent) => {
    // If sidebar is closed and clicking on the sidebar area (not on a button), open it
    if (!isOpen) {
      const target = e.target as HTMLElement
      // Only open if clicking directly on the sidebar or its background, not on buttons
      const clickedButton = target.closest('button') || target.closest('[role="button"]') || target.closest('[data-rs-button]')
      if (!clickedButton) {
        setIsOpen(true)
      }
    }
  }

  // Sync sidebar state with app layout class for layout adjustments
  useEffect(() => {
    const appLayout = document.querySelector('.app-layout')
    const header = document.querySelector('.app-header')
    const body = document.body
    
    // Ensure body never has these classes
    if (body) {
      body.classList.remove('sidebar-transitions', 'sidebar-closed')
    }
    
    if (appLayout) {
      if (hasRendered) {
        appLayout.classList.add('sidebar-transitions')
        if (header) {
          header.classList.add('sidebar-transitions')
        }
      }
      if (isOpen) {
        appLayout.classList.remove('sidebar-closed')
        if (header) {
          header.classList.remove('sidebar-closed')
        }
      } else {
        appLayout.classList.add('sidebar-closed')
        if (header) {
          header.classList.add('sidebar-closed')
        }
      }
    }
    
    // Cleanup function to remove classes from body if they somehow get added
    return () => {
      if (body) {
        body.classList.remove('sidebar-transitions', 'sidebar-closed')
      }
    }
  }, [isOpen, hasRendered])

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} ${hasRendered ? 'sidebar-transitions' : ''}`}
      onClick={!isOpen ? handleSidebarClick : undefined}
    >
      <View
        direction="column"
        gap={2}
        attributes={{
          style: {
            height: '100%',
            display: 'flex',
            padding: '16px 10px 16px 8px',
            position: 'relative',
          },
        }}
      >
        {/* Sidebar border - doesn't extend to top/bottom */}
        <div className="sidebar-border" />
        {/* Logo section - spark icon, wordmark, and panel toggle */}
        <View
          direction="row"
          align="center"
          attributes={{
            style: {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'nowrap',
              paddingLeft: '2px',
              marginBottom: '-8px', // Negative margin to cancel out View gap
            },
          }}
        >
          {/* Spark icon + KADABRA wordmark */}
          <Button
            size="large"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (!isOpen) {
                setIsOpen(true)
              }
            }}
            attributes={{
              'aria-label': isOpen ? 'Logo' : 'Open sidebar',
              className: 'sidebar-logo-button',
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 0,
                gap: '0 !important',
                flexShrink: 1,
                minWidth: 0,
              },
            }}
          >
            {/* Fixed width icon container */}
            <View
              attributes={{
                style: {
                  width: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                },
              }}
            >
              <Sparkle weight="bold" size={20} />
            </View>
            {/* Text to the right when sidebar is open */}
            {isOpen && (
              <Text
                variant="body-2"
                weight="medium"
                attributes={{
                  style: {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#202020',
                    marginLeft: '-8px',
                  },
                }}
              >
                KADABRA
              </Text>
            )}
          </Button>
          {/* Panel toggle button - conditionally rendered */}
          {isOpen && (
            <Button
              size="large"
              variant="ghost"
              icon={<SidebarSimple weight="bold" size={20} />}
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              attributes={{
                'aria-label': 'Close sidebar',
                className: 'sidebar-panel-toggle',
                style: {
                  flexShrink: 0,
                  opacity: showPanelToggle ? 1 : 0,
                  transition: hasRendered ? 'opacity 0.2s ease-in' : 'none',
                },
              }}
            />
          )}
        </View>

            {/* Dashboard button */}
            <SidebarNavButton
              icon={<SquaresFour weight="bold" size={20} />}
              label="Dashboard"
          isOpen={isOpen}
          isActive={isActive('/')}
          onClick={(e) => {
            e.stopPropagation()
            handleNavClick('/')
          }}
          ariaLabel="Dashboard"
        />

        {/* Navigation items */}
        {navItems.map((item) => (
          <SidebarNavButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            isOpen={isOpen}
            isActive={isActive(item.path)}
            onClick={(e) => {
              e.stopPropagation()
              handleNavClick(item.path)
            }}
            ariaLabel={item.label}
          />
        ))}

        {/* Bottom section: Settings, Notifications, User Avatar */}
        <View
          direction="column"
          gap={2}
          attributes={{
            style: {
              marginTop: 'auto',
              paddingTop: '16px',
            },
          }}
        >
          {/* Notifications button */}
          <SidebarNavButton
            icon={<Bell weight='bold' size={20} />}
            label="Notifications"
            isOpen={isOpen}
            isActive={false}
            onClick={(e) => {
              e.stopPropagation()
            }}
            ariaLabel="Notifications"
          />

          {/* Settings button */}
          <SidebarNavButton
            icon={<Gear weight="bold" size={20} />}
            label="Settings"
            isOpen={isOpen}
            isActive={isActive('/settings')}
            onClick={(e) => {
              e.stopPropagation()
              navigate('/settings')
            }}
            ariaLabel="Settings"
          />
        </View>
      </View>
    </aside>
  )
}

