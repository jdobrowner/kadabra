import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { View, Text } from 'reshaped'
import { useAppStore } from '../../../store/useAppStore'
import { useCustomersStore } from '../../../store/useCustomersStore'
import { AIAgentPanel } from './AIAgentPanel'

const CUSTOMER_ROUTE_PREFIXES = ['/triage/customers/']

function isCustomerContextPath(pathname: string) {
  return CUSTOMER_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function extractCustomerIdFromPath(pathname: string): string | null {
  if (pathname.startsWith('/triage/customers/')) {
    const segments = pathname.split('/')
    return segments[3] ?? null // /triage/customers/:customerId
  }
  return null
}

export function AIAgentSidebar() {
  const location = useLocation()
  const activeCustomerId = useAppStore((state) => state.activeCustomerId)
  const customers = useCustomersStore((state) => state.customers)
  const currentCustomer = useCustomersStore((state) => state.currentCustomer)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('ai-agent-panel-collapsed')
    return saved === 'true' ? true : false
  })

  const isCustomerContext = isCustomerContextPath(location.pathname)
  const derivedCustomerId =
    activeCustomerId ?? extractCustomerIdFromPath(location.pathname) ?? null

  const customerName = useMemo(() => {
    if (!derivedCustomerId) return undefined
    if (currentCustomer && currentCustomer.id === derivedCustomerId) {
      return currentCustomer.name
    }
    return customers.find((customer) => customer.id === derivedCustomerId)?.name
  }, [currentCustomer, customers, derivedCustomerId])

  if (!isCustomerContext || !derivedCustomerId) {
    return null
  }

  return (
    <div className={`app-ai-sidebar ${isCollapsed ? 'ai-sidebar-collapsed' : ''}`}>
      <AIAgentPanel 
        customerId={derivedCustomerId} 
        customerName={customerName}
        onCollapseChange={setIsCollapsed}
      />
    </div>
  )
}

