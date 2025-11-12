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
    if (appLayout) {
      if (hasRendered) {
        appLayout.classList.add('sidebar-transitions')
      }
      if (isOpen) {
        appLayout.classList.remove('sidebar-closed')
      } else {
        appLayout.classList.add('sidebar-closed')
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
        {/* Panel toggle button - right aligned */}
        <Button
          size="large"
          variant="ghost"
          icon={<SidebarSimple weight="bold" />}
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
            attributes={{
            'aria-label': isOpen ? 'Close sidebar' : 'Open sidebar',
              style: {
              width: 'auto',
              alignSelf: 'flex-end',
              },
            }}
        />

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
            },
          }}
        >
          {isOpen && (
            <Text variant="body-2" weight="medium">
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
                },
              }}
            >
              {isOpen && (
                <Text variant="body-2" weight="medium">
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
                },
              }}
            >
            {isOpen && (
              <Text variant="body-2" weight="medium">
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
                },
              }}
          >
            {isOpen && (
              <Text variant="body-2" weight="medium">
                Settings
              </Text>
          )}
          </Button>
        </View>
      </View>
    </aside>
  )
}

