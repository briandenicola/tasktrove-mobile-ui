import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomNav } from '../../../src/components/layout/BottomNav'
import { AuthProvider } from '../../../src/hooks/useAuth'

function renderBottomNav(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <BottomNav />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

describe('BottomNav', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders the Inbox button', () => {
    renderBottomNav()
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('marks Inbox as active on root path', () => {
    renderBottomNav('/')
    const inbox = screen.getByText('Inbox').closest('button')!
    expect(inbox).toHaveAttribute('aria-current', 'page')
  })

  it('renders the navigation landmark', () => {
    renderBottomNav()
    expect(screen.getByRole('navigation', { name: /project navigation/i })).toBeInTheDocument()
  })

  it('does not mark Inbox as active on project path', () => {
    renderBottomNav('/project/abc-123')
    const inbox = screen.getByText('Inbox').closest('button')!
    expect(inbox).not.toHaveAttribute('aria-current')
  })
})
