import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QuickAdd } from '../../../src/components/tasks/QuickAdd'
import { AuthProvider } from '../../../src/hooks/useAuth'

function renderQuickAdd(props: { open: boolean; onClose?: () => void }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const onClose = props.onClose ?? vi.fn()
  return {
    onClose,
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <QuickAdd open={props.open} onClose={onClose} />
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

describe('QuickAdd', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders nothing when closed', () => {
    renderQuickAdd({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open', () => {
    renderQuickAdd({ open: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('New Task')).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toBeInTheDocument()
  })

  it('shows validation error for empty title', async () => {
    const { user } = renderQuickAdd({ open: true })

    await user.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('clears validation error when typing', async () => {
    const { user } = renderQuickAdd({ open: true })

    await user.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Task title'), 'a')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const { user } = renderQuickAdd({ open: true, onClose })

    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const { user } = renderQuickAdd({ open: true, onClose })

    const dialog = screen.getByRole('dialog')
    await user.click(dialog)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not dismiss when clicking inside the panel', async () => {
    const onClose = vi.fn()
    const { user } = renderQuickAdd({ open: true, onClose })

    await user.click(screen.getByText('New Task'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('submits with title and calls API', async () => {
    localStorage.setItem('tasktrove_base_url', 'https://todo.example.com')
    localStorage.setItem('tasktrove_token', 'test-token')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          taskIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const onClose = vi.fn()
    const { user } = renderQuickAdd({ open: true, onClose })

    await user.type(screen.getByLabelText('Task title'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://todo.example.com/api/v1/tasks',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('includes subtasks in create payload', async () => {
    localStorage.setItem('tasktrove_base_url', 'https://todo.example.com')
    localStorage.setItem('tasktrove_token', 'test-token')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, taskIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { user } = renderQuickAdd({ open: true })

    await user.type(screen.getByLabelText('Task title'), 'Plan sprint')
    const subtaskInput = screen.getByLabelText('Subtask title')
    await user.click(subtaskInput)
    await user.paste('Notes')
    await user.click(screen.getByRole('button', { name: 'Add subtask' }))
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://todo.example.com/api/v1/tasks',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    const taskCall = mockFetch.mock.calls.find(([url]) => url === 'https://todo.example.com/api/v1/tasks')
    expect(taskCall).toBeTruthy()
    const body = JSON.parse((taskCall?.[1] as RequestInit).body as string)
    expect(body.subtasks).toEqual(expect.arrayContaining([expect.objectContaining({ completed: false })]))
    expect(body.subtasks[0].title.toLowerCase()).toContain('note')
  })

  it('adds labels from look-ahead input', async () => {
    localStorage.setItem('tasktrove_base_url', 'https://todo.example.com')
    localStorage.setItem('tasktrove_token', 'test-token')

    const mockFetch = vi.fn((url: string) => {
      if (url === 'https://todo.example.com/api/v1/labels') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            labels: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Bug', color: '#ff0000' }],
            meta: { count: 1, timestamp: '2026-01-01T00:00:00Z', version: '1' },
          }),
        })
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, taskIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'] }),
      })
    })

    vi.stubGlobal('fetch', mockFetch)

    const { user } = renderQuickAdd({ open: true })

    await waitFor(() => expect(screen.getByLabelText('Labels')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Task title'), 'Fix login')
    const labelInput = screen.getByLabelText('Labels')
    fireEvent.change(labelInput, { target: { value: 'Bug' } })
    await user.click(screen.getByRole('button', { name: 'Add label' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove label Bug' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://todo.example.com/api/v1/tasks',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    const taskCall = mockFetch.mock.calls.find(([url]) => url === 'https://todo.example.com/api/v1/tasks')
    expect(taskCall).toBeTruthy()
    const body = JSON.parse((taskCall?.[1] as RequestInit).body as string)
    expect(body.labels).toEqual(['11111111-1111-4111-8111-111111111111'])
  })

  it('has a due date input', () => {
    renderQuickAdd({ open: true })
    expect(screen.getByLabelText('Due date')).toBeInTheDocument()
  })
})
