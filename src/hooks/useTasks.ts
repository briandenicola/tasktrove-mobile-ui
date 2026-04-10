import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { createTaskApi } from '@/api/tasks'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListResponse,
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

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => {
      if (!client) throw new Error('Not authenticated')
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

  return useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!client) throw new Error('Not authenticated')
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

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => {
      if (!client) throw new Error('Not authenticated')
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
