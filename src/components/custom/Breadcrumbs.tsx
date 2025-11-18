import { Breadcrumbs as ReshapedBreadcrumbs, Link } from 'reshaped'
import { Link as RouterLink } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface TriageBreadcrumbsProps {
  customerName?: string
  customerId?: string
  actionPlanTitle?: string
  actionPlanId?: string
  conversationDate?: string
  conversationId?: string
  showConversationHistory?: boolean
}

export function TriageBreadcrumbs({
  customerName,
  customerId,
  actionPlanTitle,
  actionPlanId,
  conversationDate,
  conversationId,
  showConversationHistory = false
}: TriageBreadcrumbsProps) {
  const items: BreadcrumbItem[] = [
    {
      label: 'Triage',
      href: '/triage'
    }
  ]

  // Add customer breadcrumb if we have customer info
  if (customerName && customerId) {
    items.push({
      label: customerName,
      href: `/triage/customers/${customerId}`
    })
  }

  // Add action plan breadcrumb
  if (actionPlanTitle && actionPlanId && customerId) {
    items.push({
      label: 'Action Plan',
      href: `/triage/customers/${customerId}/action-plans/${actionPlanId}`
    })
  }

  // Add conversation history breadcrumb
  if (showConversationHistory && customerId) {
    items.push({
      label: 'Conversation History',
      href: `/triage/customers/${customerId}/conversations`
    })
  }

  // Add transcript breadcrumb
  if (conversationDate && conversationId && customerId) {
    // If we're showing transcript, we should also show conversation history
    if (!showConversationHistory) {
      items.push({
        label: 'Conversation History',
        href: `/triage/customers/${customerId}/conversations`
      })
    }
    items.push({
      label: 'Transcript',
      href: `/triage/customers/${customerId}/conversations/${conversationId}`
    })
  }

  return (
    <ReshapedBreadcrumbs>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        if (isLast || !item.href) {
          return (
            <ReshapedBreadcrumbs.Item key={index}>
              {item.label}
            </ReshapedBreadcrumbs.Item>
          )
        }
        return (
          <ReshapedBreadcrumbs.Item key={index} href={item.href} as={RouterLink}>
            {item.label}
          </ReshapedBreadcrumbs.Item>
        )
      })}
    </ReshapedBreadcrumbs>
  )
}

