import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useOnlineStatus } from './useOnlineStatus'
import { createTaskApi } from '@/api/tasks'
import { addToQueue } from '@/lib/storage'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListResponse,
  Task,
} from '@/lib/types'

const TASKS_KEY = ['tasks'] as const

export function useTasks() {
  const { client } = useAuth()

  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: ({ signal }) => {
      if (!client) throw new Error('Not authenticated')
      return createTaskApi(client).getTasks(signal)
    },
    enabled: !!client,
    select: (data) => data.tasks,
  })
}

export function useTask(id: string) {
  const { client } = useAuth()

  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async ({ signal }) => {
      if (!client) throw new Error('Not authenticated')
      const res = await createTaskApi(client).getTasks(signal)
      const task = res.tasks.find((t) => t.id === id)
      if (!task) throw new Error('Task not found')
      return task
    },
    enabled: !!client && !!id,
  })
}

export function useTasksByProject(projectId: string) {
  const { data: tasks, ...rest } = useTasks()

  const filtered = tasks?.filter((t) => t.projectId === projectId)

  return { data: filtered, ...rest }
}

export function useCompleteTask() {
  const { client } = useAuth()
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      if (!client) throw new Error('Not authenticated')

      // If offline, queue the mutation
      if (!isOnline) {
        await addToQueue({
          type: 'complete',
          payload: { id, completed },
        })
        return { id, completed }
      }

      // Online - update task normally
      return createTaskApi(client).updateTask({ id, completed })
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })

      const previous =
        queryClient.getQueryData<TaskListResponse>(TASKS_KEY)

      queryClient.setQueryData<TaskListResponse>(TASKS_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === id ? { ...t, completed } : t,
          ),
        }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useCreateTask() {
  const { client } = useAuth()
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!client) throw new Error('Not authenticated')

      // If offline, queue the mutation
      if (!isOnline) {
        // Generate client-side UUID for the new task
        const tempId = crypto.randomUUID()

        // Add to offline queue
        await addToQueue({
          type: 'create',
          payload: { ...input, id: tempId },
        })

        // Create optimistic task for immediate UI feedback
        const optimisticTask: Task = {
          id: tempId,
          title: input.title,
          description: input.description || '',
          completed: false,
          priority: input.priority || 3,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          projectId: input.projectId,
          ownerId: input.ownerId,
          assignees: input.assignees || [],
          labels: input.labels || [],
          subtasks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          recurring: input.recurring,
          recurringMode: input.recurringMode || 'dueDate',
          _offline: true, // Mark as offline task
        }

        // Update cache optimistically
        queryClient.setQueryData<TaskListResponse>(TASKS_KEY, (old) => {
          if (!old) {
            return {
              tasks: [optimisticTask],
              meta: { count: 1, timestamp: new Date().toISOString(), version: '1' }
            }
          }
          return {
            tasks: [...old.tasks, optimisticTask],
            meta: { ...old.meta, count: old.tasks.length + 1 }
          }
        })

        return optimisticTask
      }

      // Online - create task normally
      return createTaskApi(client).createTask(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useUpdateTask() {
  const { client } = useAuth()
  const queryClient = useQueryClient()
  const isOnline = useOnlineStatus()

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      if (!client) throw new Error('Not authenticated')

      // If offline, queue the mutation
      if (!isOnline) {
        await addToQueue({
          type: 'update',
          payload: input,
        })
        return input
      }

      // Online - update task normally
      return createTaskApi(client).updateTask(input)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })

      const previous =
        queryClient.getQueryData<TaskListResponse>(TASKS_KEY)

      queryClient.setQueryData<TaskListResponse>(TASKS_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((t) => {
            if (t.id !== input.id) return t
            const { id: _id, ...changes } = input // eslint-disable-line @typescript-eslint/no-unused-vars
            return { ...t, ...changes } as typeof t
          }),
        }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}
