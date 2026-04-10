import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { App } from '../src/App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to setup when not authenticated', () => {
    render(<App />)
    expect(screen.getByText('TaskTrove')).toBeInTheDocument()
    expect(screen.getByLabelText(/server url/i)).toBeInTheDocument()
  })

  it('shows task page when authenticated', () => {
    localStorage.setItem('tasktrove_base_url', 'https://todo.example.com')
    localStorage.setItem('tasktrove_token', 'test-token')
    render(<App />)
    expect(screen.getByText('Due Today')).toBeInTheDocument()
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument()
  })
})
