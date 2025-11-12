import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import type { Database } from '../db'
import { apiKeys, orgs } from '../db/schema'
import { eq } from 'drizzle-orm'

// Encryption key for API keys (should be set in environment)
// If not set, we'll use a default (not recommended for production)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32chars!!'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

/**
 * Encrypt a plain API key for storage
 */
function encryptApiKey(plainKey: string): string {
  const iv = randomBytes(IV_LENGTH)
  const key = createHash('sha256').update(ENCRYPTION_KEY).digest()
  
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plainKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Return: iv:tag:encrypted (all hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an encrypted API key
 */
export function decryptApiKey(encrypted: string): string {
  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted key format')
  }
  
  const [ivHex, tagHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const key = createHash('sha256').update(ENCRYPTION_KEY).digest()
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Mask an API key for display (shows first 4 and last 4 characters)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '•'.repeat(key.length)
  }
  const start = key.substring(0, 4)
  const end = key.substring(key.length - 4)
  // Show a fixed number of dots instead of matching the full length
  return `${start}••••${end}`
}

/**
 * Generate a new API key
 * Returns both the plain key (to show to user once) and the hashed version (for storage)
 */
export function generateApiKey(): { plainKey: string; hash: string } {
  const plainKey = `kad_${randomBytes(32).toString('hex')}`
  const hash = createHash('sha256').update(plainKey).digest('hex')
  return { plainKey, hash }
}

/**
 * Hash an API key for comparison
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Validate an API key and return the associated organization
 */
export async function validateApiKey(
  db: Database,
  key: string
): Promise<{ orgId: string; orgName: string } | null> {
  const keyHash = hashApiKey(key)

  const [apiKey] = await db
    .select({
      id: apiKeys.id,
      orgId: apiKeys.orgId,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1)

  if (!apiKey) {
    return null
  }

  // Check if key is expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))

  // Get org info
  const [org] = await db
    .select({
      id: orgs.id,
      name: orgs.name,
    })
    .from(orgs)
    .where(eq(orgs.id, apiKey.orgId))
    .limit(1)

  if (!org) {
    return null
  }

  return {
    orgId: org.id,
    orgName: org.name,
  }
}

/**
 * Create a new API key for an organization
 */
export async function createApiKey(
  db: Database,
  orgId: string,
  name: string,
  expiresAt?: Date
): Promise<{ id: string; plainKey: string }> {
  // Verify org exists
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1)
  if (!org) {
    throw new Error('Organization not found')
  }

  const { plainKey, hash } = generateApiKey()
  const id = `apikey-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  const encryptedKey = encryptApiKey(plainKey)

  try {
    await db.insert(apiKeys).values({
      id,
      orgId,
      name,
      keyHash: hash,
      keyEncrypted: encryptedKey,
      expiresAt: expiresAt || null,
    })
  } catch (error: any) {
    // If keyEncrypted column doesn't exist, try without it
    if (error?.message?.includes('key_encrypted') || error?.code === '42703') {
      console.warn('key_encrypted column does not exist, inserting without it. Run db:push to add the column.')
      await db.insert(apiKeys).values({
        id,
        orgId,
        name,
        keyHash: hash,
        expiresAt: expiresAt || null,
      })
    } else {
      throw error
    }
  }

  return { id, plainKey }
}

