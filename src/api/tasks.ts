import type { ApiClient } from './client'
import {
  TaskListResponseSchema,
  TaskMutationResponseSchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
} from '@/lib/schemas'
import type {
  TaskListResponse,
  TaskMutationResponse,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/lib/types'

export function createTaskApi(client: ApiClient) {
  async function getTasks(signal?: AbortSignal): Promise<TaskListResponse> {
    return client.apiFetch('/tasks', TaskListResponseSchema, { signal })
  }

  async function createTask(
    input: CreateTaskInput,
  ): Promise<TaskMutationResponse> {
    const body = CreateTaskInputSchema.parse(input)
    return client.apiFetch('/tasks', TaskMutationResponseSchema, {
      method: 'POST',
      body,
    })
  }

  async function updateTask(
    input: UpdateTaskInput,
  ): Promise<TaskMutationResponse> {
    const body = UpdateTaskInputSchema.parse(input)
    return client.apiFetch('/tasks', TaskMutationResponseSchema, {
      method: 'PATCH',
      body,
    })
  }

  async function deleteTasks(
    ids: string[],
  ): Promise<TaskMutationResponse> {
    return client.apiFetch('/tasks', TaskMutationResponseSchema, {
      method: 'DELETE',
      body: { ids },
    })
  }

  return { getTasks, createTask, updateTask, deleteTasks }
}
