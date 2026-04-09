import type { z } from 'zod'
import { ApiErrorSchema } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'

export class ApiClientError extends Error {
  readonly status: number
  readonly apiError: ApiError | null

  constructor(status: number, apiError: ApiError | null, message?: string) {
    super(message ?? apiError?.message ?? `API error (${status})`)
    this.name = 'ApiClientError'
    this.status = status
    this.apiError = apiError
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

interface ApiClientOptions {
  baseUrl: string
  token: string
}

type RequestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

function buildHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function parseErrorBody(response: Response): Promise<ApiError | null> {
  try {
    const body: unknown = await response.json()
    const result = ApiErrorSchema.safeParse(body)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function createApiClient({ baseUrl, token }: ApiClientOptions) {
  const apiBase = `${baseUrl}/api/v1`
  const headers = buildHeaders(token)

  async function apiFetch<T>(
    path: string,
    schema: z.ZodType<T>,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = 'GET', body, signal } = options

    let response: Response
    try {
      response = await fetch(`${apiBase}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      })
    } catch (err) {
      throw new NetworkError(err)
    }

    if (!response.ok) {
      const apiError = await parseErrorBody(response)
      throw new ApiClientError(response.status, apiError)
    }

    const json: unknown = await response.json()
    const result = schema.safeParse(json)
    if (!result.success) {
      throw new Error(
        `API response validation failed: ${result.error.message}`,
      )
    }
    return result.data
  }

  return { apiFetch }
}

export type ApiClient = ReturnType<typeof createApiClient>
