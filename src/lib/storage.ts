/**
 * IndexedDB storage layer for offline persistence
 */
import { get, set, del } from 'idb-keyval'
import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core'

/**
 * Create a persister for TanStack Query using IndexedDB
 */
export function createIDBPersister(idbKey = 'tasktrove_query_cache'): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbKey, client)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbKey)
    },
    removeClient: async () => {
      await del(idbKey)
    },
  }
}

/**
 * Mutation queue types
 */
export type MutationType = 'create' | 'update' | 'complete'

export interface QueuedMutation {
  id: string // Unique ID for this queued operation
  type: MutationType
  timestamp: number
  payload: unknown
  retries: number
}

const QUEUE_KEY = 'tasktrove_mutation_queue'

/**
 * Get all queued mutations
 */
export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  const queue = await get<QueuedMutation[]>(QUEUE_KEY)
  return queue || []
}

/**
 * Add a mutation to the queue
 */
export async function addToQueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  const queue = await getQueuedMutations()
  const id = crypto.randomUUID()
  const newMutation: QueuedMutation = {
    ...mutation,
    id,
    timestamp: Date.now(),
    retries: 0,
  }
  queue.push(newMutation)
  await set(QUEUE_KEY, queue)
  return id
}

/**
 * Remove a mutation from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueuedMutations()
  const filtered = queue.filter((m) => m.id !== id)
  await set(QUEUE_KEY, filtered)
}

/**
 * Update retry count for a mutation
 */
export async function incrementRetries(id: string): Promise<void> {
  const queue = await getQueuedMutations()
  const updated = queue.map((m) =>
    m.id === id ? { ...m, retries: m.retries + 1 } : m
  )
  await set(QUEUE_KEY, updated)
}

/**
 * Clear all queued mutations
 */
export async function clearQueue(): Promise<void> {
  await del(QUEUE_KEY)
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{ count: number; oldestTimestamp: number | null }> {
  const queue = await getQueuedMutations()
  return {
    count: queue.length,
    oldestTimestamp: queue.length > 0
      ? Math.min(...queue.map(m => m.timestamp))
      : null,
  }
}
