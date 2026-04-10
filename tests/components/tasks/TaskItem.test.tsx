import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskItem } from '../../../src/components/tasks/TaskItem'
import type { Task } from '../../../src/lib/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Buy groceries',
    completed: false,
    priority: 2,
    labels: [],
    subtasks: [],
    comments: [],
    createdAt: '2026-01-15T12:00:00Z',
    recurringMode: 'dueDate',
    dueDate: undefined,
    ...overrides,
  } as Task
}

describe('TaskItem', () => {
  it('renders the task title', () => {
    render(<TaskItem task={makeTask()} onToggle={vi.fn()} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('shows priority badge for non-low priorities', () => {
    render(<TaskItem task={makeTask({ priority: 1 })} onToggle={vi.fn()} />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('hides priority badge for low priority (4)', () => {
    render(<TaskItem task={makeTask({ priority: 4 })} onToggle={vi.fn()} />)
    expect(screen.queryByText('Low')).not.toBeInTheDocument()
  })

  it('shows relative due date when present', () => {
    const d = new Date()
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    render(
      <TaskItem task={makeTask({ dueDate: dateStr })} onToggle={vi.fn()} />,
    )
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('applies strikethrough when completed', () => {
    render(<TaskItem task={makeTask({ completed: true })} onToggle={vi.fn()} />)
    const title = screen.getByText('Buy groceries')
    expect(title).toHaveClass('line-through')
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<TaskItem task={makeTask()} onToggle={onToggle} />)

    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('task-1', true)
  })

  it('calls onToggle with false when completed task checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <TaskItem task={makeTask({ completed: true })} onToggle={onToggle} />,
    )

    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('task-1', false)
  })

  it('calls onTap when task row is clicked', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()
    render(<TaskItem task={makeTask()} onToggle={vi.fn()} onTap={onTap} />)

    await user.click(screen.getByText('Buy groceries'))
    expect(onTap).toHaveBeenCalledWith('task-1')
  })

  it('shows loading state on checkbox', () => {
    render(
      <TaskItem task={makeTask()} onToggle={vi.fn()} loading={true} />,
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
