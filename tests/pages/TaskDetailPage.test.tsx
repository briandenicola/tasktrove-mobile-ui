import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../src/hooks/useAuth'
import { TaskDetailPage } from '../../src/pages/TaskDetailPage'

const taskId = '11111111-1111-4111-8111-111111111111'

function renderTaskDetailPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/', `/task/${taskId}`]} initialIndex={1}>
            <Routes>
              <Route path="/" element={<div>Previous page</div>} />
              <Route path="/task/:id" element={<TaskDetailPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    localStorage.setItem('tasktrove_base_url', 'https://todo.example.com')
    localStorage.setItem('tasktrove_token', 'test-token')
  })

  it('shows icon-only header actions and deletes the task', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const mockFetch = vi.fn((url: string, init?: RequestInit) => {
      if (url === 'https://todo.example.com/api/v1/tasks' && init?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, taskIds: [taskId] }),
        })
      }

      if (url === 'https://todo.example.com/api/v1/tasks') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            tasks: [{
              id: taskId,
              title: 'Task to delete',
              completed: false,
              priority: 3,
              labels: [],
              subtasks: [],
              comments: [],
              createdAt: '2026-01-15T12:00:00Z',
              recurringMode: 'dueDate',
            }],
            meta: { count: 1, timestamp: '2026-01-15T12:00:00Z', version: '1' },
          }),
        })
      }

      if (url === 'https://todo.example.com/api/v1/projects') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            projects: [],
            meta: { count: 0, timestamp: '2026-01-15T12:00:00Z', version: '1' },
          }),
        })
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          labels: [],
          meta: { count: 0, timestamp: '2026-01-15T12:00:00Z', version: '1' },
        }),
      })
    })
    vi.stubGlobal('fetch', mockFetch)

    const { user } = renderTaskDetailPage()

    expect(await screen.findByLabelText('Back')).toHaveTextContent('←')
    expect(screen.queryByText('Back')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete task' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://todo.example.com/api/v1/tasks',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ ids: [taskId] }),
        }),
      )
    })
    expect(confirmSpy).toHaveBeenCalledWith('Delete this task?')
    expect(await screen.findByText('Previous page')).toBeInTheDocument()
  })
})
