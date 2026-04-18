/**
 * Sync manager hook - processes offline mutation queue when online
 */
import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from './useOnlineStatus'
import { useAuth } from './useAuth'
import {
  getQueuedMutations,
  removeFromQueue,
  incrementRetries,
  getQueueStats,
  type QueuedMutation,
} from '@/lib/storage'
import { createTaskApi } from '@/api/tasks'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/types'

const MAX_RETRIES = 3

export interface SyncStatus {
  isSyncing: boolean
  pendingCount: number
  lastSyncTime: number | null
  error: string | null
}

/**
 * Hook to manage offline mutation queue sync
 */
export function useSyncManager() {
  const isOnline = useOnlineStatus()
  const { client } = useAuth()
  const queryClient = useQueryClient()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    error: null,
  })

  /**
   * Process a single queued mutation
   */
  const processMutation = useCallback(
    async (mutation: QueuedMutation): Promise<boolean> => {
      if (!client) return false

      const api = createTaskApi(client)

      try {
        switch (mutation.type) {
          case 'create': {
            const input = mutation.payload as CreateTaskInput
            await api.createTask(input)
            break
          }
          case 'update': {
            const input = mutation.payload as UpdateTaskInput
            await api.updateTask(input)
            break
          }
          case 'complete': {
            const { id, completed } = mutation.payload as {
              id: string
              completed: boolean
            }
            await api.updateTask({ id, completed })
            break
          }
        }
        return true
      } catch (error) {
        console.error('Failed to process mutation:', mutation, error)
        return false
      }
    },
    [client]
  )

  /**
   * Process all queued mutations
   */
  const processQueue = useCallback(async () => {
    if (!isOnline || !client || syncStatus.isSyncing) return

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }))

    try {
      const mutations = await getQueuedMutations()

      for (const mutation of mutations) {
        const success = await processMutation(mutation)

        if (success) {
          await removeFromQueue(mutation.id)
        } else {
          // Increment retry count
          await incrementRetries(mutation.id)

          // Remove if max retries exceeded
          if (mutation.retries >= MAX_RETRIES) {
            console.warn(
              `Mutation ${mutation.id} exceeded max retries, removing from queue`
            )
            await removeFromQueue(mutation.id)
          }
        }
      }

      // Invalidate queries after successful sync
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Update sync status
      const stats = await getQueueStats()
      setSyncStatus({
        isSyncing: false,
        pendingCount: stats.count,
        lastSyncTime: Date.now(),
        error: null,
      })
    } catch (error) {
      console.error('Queue processing failed:', error)
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }))
    }
  }, [isOnline, client, syncStatus.isSyncing, processMutation, queryClient])

  /**
   * Update pending count
   */
  const updatePendingCount = useCallback(async () => {
    const stats = await getQueueStats()
    setSyncStatus((prev) => ({ ...prev, pendingCount: stats.count }))
  }, [])

  /**
   * Auto-sync when coming online
   */
  useEffect(() => {
    if (isOnline && client) {
      processQueue()
    }
  }, [isOnline, client, processQueue])

  /**
   * Initialize pending count on mount
   */
  useEffect(() => {
    updatePendingCount()
  }, [updatePendingCount])

  return {
    syncStatus,
    processQueue,
    updatePendingCount,
  }
}
