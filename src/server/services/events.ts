/**
 * Centralized event emitter for database changes
 * Supports both in-memory events (for single-instance) and can be extended
 * to use Redis pub/sub for multi-instance deployments
 */

export type ChangeType =
  | 'customer'
  | 'conversation'
  | 'actionPlan'
  | 'actionItem'
  | 'task'
  | 'csvJob'
  | 'team'
  | 'board'
  | 'boardCard'
  | 'routingRule'
export type ChangeAction = 'created' | 'updated' | 'deleted'

export interface DatabaseChange {
  type: ChangeType
  action: ChangeAction
  orgId: string
  id: string
  data?: any // Optional: include full data for immediate UI updates
  timestamp: Date
}

type ChangeListener = (change: DatabaseChange) => void

class EventEmitter {
  private listeners: Map<string, Set<ChangeListener>> = new Map()
  private orgListeners: Map<string, Set<ChangeListener>> = new Map()

  /**
   * Emit a database change event
   */
  emit(change: DatabaseChange): void {
    const key = `${change.type}:${change.action}`
    
    // Emit to type-specific listeners
    const typeListeners = this.listeners.get(key)
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(change)
        } catch (error) {
          console.error(`Error in event listener for ${key}:`, error)
        }
      })
    }

    // Emit to org-specific listeners
    const orgListeners = this.orgListeners.get(change.orgId)
    if (orgListeners) {
      orgListeners.forEach(listener => {
        try {
          listener(change)
        } catch (error) {
          console.error(`Error in org event listener for ${change.orgId}:`, error)
        }
      })
    }

    // Emit to wildcard listeners (all changes)
    const allListeners = this.listeners.get('*')
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(change)
        } catch (error) {
          console.error('Error in wildcard event listener:', error)
        }
      })
    }
  }

  /**
   * Subscribe to specific change types
   * @param type - Change type to listen for (e.g., 'customer', 'conversation')
   * @param action - Action to listen for (e.g., 'created', 'updated') or '*' for all
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  subscribe(
    type: ChangeType | '*',
    action: ChangeAction | '*',
    listener: ChangeListener
  ): () => void {
    const key = `${type}:${action}`
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key)!.add(listener)

    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  /**
   * Subscribe to all changes for a specific organization
   * @param orgId - Organization ID
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  subscribeToOrg(orgId: string, listener: ChangeListener): () => void {
    if (!this.orgListeners.has(orgId)) {
      this.orgListeners.set(orgId, new Set())
    }
    
    this.orgListeners.get(orgId)!.add(listener)

    return () => {
      const listeners = this.orgListeners.get(orgId)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          this.orgListeners.delete(orgId)
        }
      }
    }
  }

  /**
   * Subscribe to all changes (wildcard)
   */
  subscribeToAll(listener: ChangeListener): () => void {
    return this.subscribe('*', '*', listener)
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter()

/**
 * Helper functions to emit common change events
 */
export const emitCustomerChange = (
  action: ChangeAction,
  orgId: string,
  customerId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'customer',
    action,
    orgId,
    id: customerId,
    data,
    timestamp: new Date(),
  })
}

export const emitConversationChange = (
  action: ChangeAction,
  orgId: string,
  conversationId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'conversation',
    action,
    orgId,
    id: conversationId,
    data,
    timestamp: new Date(),
  })
}

export const emitActionPlanChange = (
  action: ChangeAction,
  orgId: string,
  actionPlanId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'actionPlan',
    action,
    orgId,
    id: actionPlanId,
    data,
    timestamp: new Date(),
  })
}

export const emitCsvJobChange = (
  action: ChangeAction,
  orgId: string,
  jobId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'csvJob',
    action,
    orgId,
    id: jobId,
    data,
    timestamp: new Date(),
  })
}

export const emitTeamChange = (
  action: ChangeAction,
  orgId: string,
  teamId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'team',
    action,
    orgId,
    id: teamId,
    data,
    timestamp: new Date(),
  })
}

export const emitBoardChange = (
  action: ChangeAction,
  orgId: string,
  boardId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'board',
    action,
    orgId,
    id: boardId,
    data,
    timestamp: new Date(),
  })
}

export const emitBoardCardChange = (
  action: ChangeAction,
  orgId: string,
  cardId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'boardCard',
    action,
    orgId,
    id: cardId,
    data,
    timestamp: new Date(),
  })
}

export const emitRoutingRuleChange = (
  action: ChangeAction,
  orgId: string,
  ruleId: string,
  data?: any
) => {
  eventEmitter.emit({
    type: 'routingRule',
    action,
    orgId,
    id: ruleId,
    data,
    timestamp: new Date(),
  })
}

