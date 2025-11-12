/**
 * PostgreSQL LISTEN/NOTIFY service for real-time database change notifications
 * This allows external changes (like from the ingest API) to trigger events
 */

// import { sql } from '@vercel/postgres' // TODO: Re-enable when needed
import { eventEmitter } from './events'
import type { DatabaseChange } from './events'

let listening = false

/**
 * Start listening to PostgreSQL NOTIFY events
 */
export async function startListening() {
  if (listening) {
    return
  }

  try {
    // Use a separate connection for LISTEN
    // Note: Vercel Postgres uses connection pooling, so we need to handle this carefully
    // For production, consider using a dedicated connection pool or Redis pub/sub
    
    // For now, we'll use the event emitter directly from mutations
    // PostgreSQL LISTEN/NOTIFY would require a persistent connection
    // which is tricky with serverless functions
    
    // This is a placeholder - in production, you'd set up a dedicated worker
    // that maintains a persistent connection to LISTEN for notifications
    
    listening = true
    console.log('Database notification listener started (using event emitter)')
  } catch (error) {
    console.error('Failed to start database notification listener:', error)
    listening = false
  }
}

/**
 * Send a NOTIFY event to PostgreSQL
 * This is called from external APIs (like ingest) to trigger events
 */
export async function notifyDatabaseChange(change: DatabaseChange) {
  try {
    // In a production setup with persistent connections, you'd do:
    // await sql`NOTIFY db_changes, ${JSON.stringify(change)}`
    
    // For now, we'll emit directly to the event emitter
    // This works for single-instance deployments
    // For multi-instance, you'd need Redis pub/sub or a message queue
    eventEmitter.emit(change)
  } catch (error) {
    console.error('Failed to notify database change:', error)
  }
}

/**
 * Stop listening to PostgreSQL NOTIFY events
 */
export async function stopListening() {
  listening = false
  console.log('Database notification listener stopped')
}

