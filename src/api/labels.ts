import type { ApiClient } from './client'
import { LabelListResponseSchema } from '@/lib/schemas'
import type { LabelListResponse } from '@/lib/types'

export function createLabelApi(client: ApiClient) {
  async function getLabels(signal?: AbortSignal): Promise<LabelListResponse> {
    return client.apiFetch('/labels', LabelListResponseSchema, { signal })
  }

  return { getLabels }
}
