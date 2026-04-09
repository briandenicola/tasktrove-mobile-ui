import type { ApiClient } from './client'
import { ProjectListResponseSchema } from '@/lib/schemas'
import type { ProjectListResponse } from '@/lib/types'

export function createProjectApi(client: ApiClient) {
  async function getProjects(
    signal?: AbortSignal,
  ): Promise<ProjectListResponse> {
    return client.apiFetch('/projects', ProjectListResponseSchema, { signal })
  }

  return { getProjects }
}
