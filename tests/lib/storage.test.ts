import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getQueuedMutations,
  addToQueue,
  removeFromQueue,
  incrementRetries,
  clearQueue,
  getQueueStats,
  type QueuedMutation,
} from '@/lib/storage'

// Mock idb-keyval
const { get, set, del } = await import('idb-keyval')

describe('Offline Storage - Mutation Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addToQueue', () => {
    it('should add a mutation to the queue', async () => {
      const mutation = {
        type: 'create' as const,
        payload: { title: 'Test task', priority: 3 },
      }

      const id = await addToQueue(mutation)

      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
      expect(set).toHaveBeenCalled()
    })

    it('should add timestamp and retry count to mutation', async () => {
      const mutation = {
        type: 'update' as const,
        payload: { id: 'task-1', completed: true },
      }

      await addToQueue(mutation)

      const calls = vi.mocked(set).mock.calls
      const queueData = calls[0]?.[1] as QueuedMutation[]
      const addedMutation = queueData[0]

      expect(addedMutation).toMatchObject({
        type: 'update',
        payload: { id: 'task-1', completed: true },
        retries: 0,
      })
      expect(addedMutation?.timestamp).toBeTruthy()
      expect(typeof addedMutation?.timestamp).toBe('number')
    })
  })

  describe('getQueuedMutations', () => {
    it('should return empty array when queue is empty', async () => {
      vi.mocked(get).mockResolvedValue(undefined)

      const mutations = await getQueuedMutations()

      expect(mutations).toEqual([])
    })

    it('should return queued mutations', async () => {
      const mockQueue: QueuedMutation[] = [
        {
          id: 'mut-1',
          type: 'create',
          timestamp: Date.now(),
          payload: { title: 'Task 1' },
          retries: 0,
        },
      ]
      vi.mocked(get).mockResolvedValue(mockQueue)

      const mutations = await getQueuedMutations()

      expect(mutations).toEqual(mockQueue)
    })
  })

  describe('removeFromQueue', () => {
    it('should remove a mutation from the queue', async () => {
      const mockQueue: QueuedMutation[] = [
        {
          id: 'mut-1',
          type: 'create',
          timestamp: Date.now(),
          payload: { title: 'Task 1' },
          retries: 0,
        },
        {
          id: 'mut-2',
          type: 'update',
          timestamp: Date.now(),
          payload: { id: 'task-1', completed: true },
          retries: 0,
        },
      ]
      vi.mocked(get).mockResolvedValue(mockQueue)

      await removeFromQueue('mut-1')

      const calls = vi.mocked(set).mock.calls
      const updatedQueue = calls[0]?.[1] as QueuedMutation[]

      expect(updatedQueue).toHaveLength(1)
      expect(updatedQueue[0]?.id).toBe('mut-2')
    })
  })

  describe('incrementRetries', () => {
    it('should increment retry count for a mutation', async () => {
      const mockQueue: QueuedMutation[] = [
        {
          id: 'mut-1',
          type: 'create',
          timestamp: Date.now(),
          payload: { title: 'Task 1' },
          retries: 0,
        },
      ]
      vi.mocked(get).mockResolvedValue(mockQueue)

      await incrementRetries('mut-1')

      const calls = vi.mocked(set).mock.calls
      const updatedQueue = calls[0]?.[1] as QueuedMutation[]

      expect(updatedQueue[0]?.retries).toBe(1)
    })
  })

  describe('clearQueue', () => {
    it('should clear the entire queue', async () => {
      await clearQueue()

      expect(del).toHaveBeenCalled()
    })
  })

  describe('getQueueStats', () => {
    it('should return zero count for empty queue', async () => {
      vi.mocked(get).mockResolvedValue(undefined)

      const stats = await getQueueStats()

      expect(stats).toEqual({
        count: 0,
        oldestTimestamp: null,
      })
    })

    it('should return count and oldest timestamp', async () => {
      const now = Date.now()
      const mockQueue: QueuedMutation[] = [
        {
          id: 'mut-1',
          type: 'create',
          timestamp: now - 1000,
          payload: {},
          retries: 0,
        },
        {
          id: 'mut-2',
          type: 'update',
          timestamp: now,
          payload: {},
          retries: 0,
        },
      ]
      vi.mocked(get).mockResolvedValue(mockQueue)

      const stats = await getQueueStats()

      expect(stats.count).toBe(2)
      expect(stats.oldestTimestamp).toBe(now - 1000)
    })
  })
})
