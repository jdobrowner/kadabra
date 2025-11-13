import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { View, Text, Icon, Button } from 'reshaped'
import {
  House,
  Lightning,
  Gear,
  SidebarSimple,
  MagnifyingGlass,
  Cards,
  Calendar,
  Upload,
  Bell,
  Sparkle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import './Sidebar.css'

interface NavItem {
  path: string
  icon: React.ReactElement
  label: string
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [hasRendered, setHasRendered] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const isDeveloperOrAdmin = user?.role === 'admin' || user?.role === 'developer'

  // Mark as rendered after initial mount to enable transitions
  useEffect(() => {
    setHasRendered(true)
  }, [])

  const navItems: NavItem[] = [
    { path: '/triage', icon: <Lightning weight="bold" />, label: 'Triage' },
    { path: '/search', icon: <MagnifyingGlass weight="bold" />, label: 'Search' },
    { path: '/boards', icon: <Cards weight="bold" />, label: 'Boards' },
    { path: '/calendar', icon: <Calendar weight="bold" />, label: 'Calendar' },
    ...(isDeveloperOrAdmin 
      ? [{ path: '/import-data', icon: <Upload weight="bold" />, label: 'Import' }]
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
            padding: '16px 4px'
          },
        }}
      >
        {/* Logo section - spark icon, wordmark, and panel toggle */}
        {isOpen ? (
          <View
            direction="row"
            gap={2}
            align="center"
            attributes={{
              style: {
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: '8px',
              },
            }}
          >
            {/* Spark icon + KADABRA wordmark - styled like other sidebar items */}
            <View
              direction="row"
              gap={2}
              align="center"
              attributes={{
                style: {
                  flex: 1,
                  justifyContent: 'flex-start',
                  paddingLeft: '12px', // Consistent horizontal position with other icons
                },
              }}
            >
              <Icon
                svg={<Sparkle weight="bold" />}
                size={5}
                className="sidebar-logo-icon"
              />
              <Text variant="body-2" weight="medium" attributes={{
                style: {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#000000',
                },
              }}>
                KADABRA
              </Text>
            </View>
            {/* Panel toggle button - inline to the right */}
            <Button
              size="large"
              variant="ghost"
              icon={<SidebarSimple weight="bold" />}
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              attributes={{
                'aria-label': 'Close sidebar',
                style: {
                  width: 'auto',
                  flexShrink: 0,
                },
              }}
            />
          </View>
        ) : (
          /* When closed: Spark icon aligned with other icons, acts as toggle */
          <Button
            size="large"
            variant="ghost"
            icon={<Sparkle weight="bold" />}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            attributes={{
              'aria-label': 'Open sidebar',
              style: {
                width: 'auto',
                justifyContent: 'flex-start',
                marginBottom: '8px',
                paddingLeft: '12px', // Consistent horizontal position
              },
            }}
          />
        )}

        {/* Dashboard button - left aligned */}
            <Button
              size="large"
          variant={isActive('/') ? 'solid' : 'ghost'}
          icon={<House weight="bold" />}
              onClick={(e) => {
                e.stopPropagation()
            handleNavClick('/')
              }}
          attributes={{
            'aria-label': 'Dashboard',
            style: {
              width: 'auto',
              justifyContent: 'flex-start',
              gap: isOpen ? '4px' : '0',
              paddingLeft: '12px', // Consistent horizontal position
            },
          }}
        >
          {isOpen && (
            <Text variant="body-2" weight="medium" attributes={{
              style: {
                fontSize: '16px',
              },
            }}>
              Dashboard
            </Text>
          )}
        </Button>

        {/* Navigation items - always left aligned */}
          {navItems.map((item) => (
            <Button
              key={item.path}
              size="large"
              variant={isActive(item.path) ? 'solid' : 'ghost'}
              icon={item.icon}
              onClick={(e) => {
                e.stopPropagation()
                handleNavClick(item.path)
              }}
              attributes={{
                'aria-label': item.label,
                style: {
                width: 'auto',
                justifyContent: 'flex-start',
                gap: isOpen ? '4px' : '0',
                paddingLeft: '12px', // Consistent horizontal position
                },
              }}
            >
              {isOpen && (
                <Text variant="body-2" weight="medium" attributes={{
                  style: {
                    fontSize: '16px',
                  },
                }}>
                  {item.label}
                </Text>
              )}
            </Button>
          ))}

        {/* Bottom section: Settings, Notifications, User Avatar */}
        <View
          direction="column"
          gap={2}
          attributes={{
            style: {
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--rs-color-border-neutral-faded)',
            },
          }}
        >
          {/* Notifications button - always left aligned */}
            <Button
              size="large"
            variant="ghost"
            icon={<Icon svg={<Bell weight='bold' />} size={5} />}
              onClick={(e) => {
                e.stopPropagation()
              }}
              attributes={{
              'aria-label': 'Notifications',
                style: {
                width: 'auto',
                  justifyContent: 'flex-start',
                gap: isOpen ? '4px' : '0',
                paddingLeft: '12px', // Consistent horizontal position
                },
              }}
            >
            {isOpen && (
              <Text variant="body-2" weight="medium" attributes={{
                style: {
                  fontSize: '16px',
                },
              }}>
                Notifications
              </Text>
            )}
            </Button>

          {/* Settings button - always left aligned */}
            <Button
              size="large"
              variant={isActive('/settings') ? 'solid' : 'ghost'}
              icon={<Gear weight="bold" />}
              onClick={(e) => {
                e.stopPropagation()
                navigate('/settings')
              }}
              attributes={{
                'aria-label': 'Settings',
                style: {
                width: 'auto',
                justifyContent: 'flex-start',
                gap: isOpen ? '4px' : '0',
                paddingLeft: '12px', // Consistent horizontal position
                },
              }}
          >
            {isOpen && (
              <Text variant="body-2" weight="medium" attributes={{
                style: {
                  fontSize: '16px',
                },
              }}>
                Settings
              </Text>
          )}
          </Button>
        </View>
      </View>
    </aside>
  )
}

