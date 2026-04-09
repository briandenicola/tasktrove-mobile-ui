import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiClient, ApiClientError, NetworkError } from '../../src/api/client'
import { z } from 'zod'

const BASE_URL = 'https://todo.example.com'
const TOKEN = 'test-token-123'

function mockFetch(response: {
  ok?: boolean
  status?: number
  json?: () => Promise<unknown>
}) {
  return vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: response.json ?? (() => Promise.resolve({})),
  })
}

describe('createApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends Authorization header with Bearer token', async () => {
    const fetchSpy = mockFetch({
      json: () => Promise.resolve({ value: 'ok' }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({ value: z.string() })

    await client.apiFetch('/tasks', schema)

    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/tasks`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
      }),
    )
  })

  it('validates response with Zod schema', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        json: () => Promise.resolve({ count: 42 }),
      }),
    )

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({ count: z.number() })

    const result = await client.apiFetch('/test', schema)
    expect(result).toEqual({ count: 42 })
  })

  it('throws on Zod validation failure', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        json: () => Promise.resolve({ wrong: 'shape' }),
      }),
    )

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({ count: z.number() })

    await expect(client.apiFetch('/test', schema)).rejects.toThrow(
      /validation failed/i,
    )
  })

  it('throws ApiClientError on non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            code: 'AUTHENTICATION_REQUIRED',
            error: 'Unauthorized',
            message: 'Auth required',
          }),
      }),
    )

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({})

    try {
      await client.apiFetch('/test', schema)
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError)
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(401)
      expect(apiErr.isUnauthorized).toBe(true)
      expect(apiErr.apiError?.code).toBe('AUTHENTICATION_REQUIRED')
    }
  })

  it('throws NetworkError when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({})

    await expect(client.apiFetch('/test', schema)).rejects.toBeInstanceOf(
      NetworkError,
    )
  })

  it('sends JSON body for POST requests', async () => {
    const fetchSpy = mockFetch({
      json: () => Promise.resolve({ success: true }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const client = createApiClient({ baseUrl: BASE_URL, token: TOKEN })
    const schema = z.object({ success: z.boolean() })

    await client.apiFetch('/tasks', schema, {
      method: 'POST',
      body: { title: 'New task' },
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/tasks`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New task' }),
      }),
    )
  })
})
