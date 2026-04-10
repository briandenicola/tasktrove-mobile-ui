import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SetupScreen } from '../../../src/components/auth/SetupScreen'
import { AuthProvider } from '../../../src/hooks/useAuth'

function renderSetupScreen(onConnected = vi.fn()) {
  return {
    onConnected,
    user: userEvent.setup(),
    ...render(
      <AuthProvider>
        <SetupScreen onConnected={onConnected} />
      </AuthProvider>,
    ),
  }
}

describe('SetupScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders the form with URL and token inputs', () => {
    renderSetupScreen()

    expect(screen.getByLabelText(/server url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/api token/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const { user } = renderSetupScreen()

    await user.click(screen.getByRole('button', { name: /connect/i }))

    expect(screen.getByText(/server url is required/i)).toBeInTheDocument()
    expect(screen.getByText(/api token is required/i)).toBeInTheDocument()
  })

  it('shows validation error for empty URL only', async () => {
    const { user } = renderSetupScreen()

    await user.type(screen.getByLabelText(/api token/i), 'my-secret')
    await user.click(screen.getByRole('button', { name: /connect/i }))

    expect(screen.getByText(/server url is required/i)).toBeInTheDocument()
    expect(screen.queryByText(/api token is required/i)).not.toBeInTheDocument()
  })

  it('calls API and navigates on successful connection', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          tasks: [],
          meta: { count: 0, timestamp: '2026-01-01', version: '1.0' },
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { user, onConnected } = renderSetupScreen()

    await user.type(
      screen.getByLabelText(/server url/i),
      'https://todo.example.com',
    )
    await user.type(screen.getByLabelText(/api token/i), 'valid-token')
    await user.click(screen.getByRole('button', { name: /connect/i }))

    await vi.waitFor(() => {
      expect(onConnected).toHaveBeenCalled()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://todo.example.com/api/v1/tasks',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      }),
    )
  })

  it('shows "Invalid token" for 401 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            code: 'AUTHENTICATION_FAILED',
            error: 'Unauthorized',
            message: 'Invalid credentials',
          }),
      }),
    )

    const { user, onConnected } = renderSetupScreen()

    await user.type(
      screen.getByLabelText(/server url/i),
      'https://todo.example.com',
    )
    await user.type(screen.getByLabelText(/api token/i), 'bad-token')
    await user.click(screen.getByRole('button', { name: /connect/i }))

    await vi.waitFor(() => {
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument()
    })
    expect(onConnected).not.toHaveBeenCalled()
  })

  it('shows "Server unreachable" for network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const { user, onConnected } = renderSetupScreen()

    await user.type(
      screen.getByLabelText(/server url/i),
      'https://bad-host.invalid',
    )
    await user.type(screen.getByLabelText(/api token/i), 'some-token')
    await user.click(screen.getByRole('button', { name: /connect/i }))

    await vi.waitFor(() => {
      expect(screen.getByText(/server unreachable/i)).toBeInTheDocument()
    })
    expect(onConnected).not.toHaveBeenCalled()
  })

  it('toggles token visibility', async () => {
    const { user } = renderSetupScreen()

    const tokenInput = screen.getByLabelText(/api token/i)
    expect(tokenInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show/i }))
    expect(tokenInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide/i }))
    expect(tokenInput).toHaveAttribute('type', 'password')
  })

  it('prepends https:// when missing from URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          tasks: [],
          meta: { count: 0, timestamp: '2026-01-01', version: '1.0' },
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { user } = renderSetupScreen()

    await user.type(screen.getByLabelText(/server url/i), 'todo.example.com')
    await user.type(screen.getByLabelText(/api token/i), 'my-token')
    await user.click(screen.getByRole('button', { name: /connect/i }))

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://todo.example.com/api/v1/tasks',
        expect.anything(),
      )
    })
  })
})
