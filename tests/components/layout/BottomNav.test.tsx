import { render, screen } from '@testing-library/react'
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

  it('renders the Today tab', () => {
    renderBottomNav()
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders the Upcoming tab', () => {
    renderBottomNav()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
  })

  it('marks Today as active on root path', () => {
    renderBottomNav('/')
    const today = screen.getByText('Today').closest('button')!
    expect(today).toHaveAttribute('aria-current', 'page')
  })

  it('renders the navigation landmark', () => {
    renderBottomNav()
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })

  it('renders all five tabs', () => {
    renderBottomNav()
    const tabs = ['Today', 'Upcoming', 'Add', 'Search', 'Done']
    for (const label of tabs) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('does not mark Today as active on upcoming path', () => {
    renderBottomNav('/upcoming')
    const today = screen.getByText('Today').closest('button')!
    expect(today).not.toHaveAttribute('aria-current')
    const upcoming = screen.getByText('Upcoming').closest('button')!
    expect(upcoming).toHaveAttribute('aria-current', 'page')
  })
})
