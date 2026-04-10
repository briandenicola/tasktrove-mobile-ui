import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskList } from '../../../src/components/tasks/TaskList'
import type { Task } from '../../../src/lib/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test task',
    completed: false,
    priority: 3,
    labels: [],
    subtasks: [],
    comments: [],
    createdAt: '2026-01-15T12:00:00Z',
    recurringMode: 'dueDate',
    dueDate: undefined,
    ...overrides,
  } as Task
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('TaskList', () => {
  it('renders empty state when no active tasks', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders empty state when all tasks are completed', () => {
    const tasks = [makeTask({ id: '1', completed: true })]
    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('groups tasks by date with section headers', () => {
    const tasks = [
      makeTask({
        id: 'overdue-1',
        title: 'Overdue task',
        dueDate: daysFromNow(-3),
      }),
      makeTask({
        id: 'today-1',
        title: 'Today task',
        dueDate: todayStr(),
      }),
      makeTask({
        id: 'upcoming-1',
        title: 'Future task',
        dueDate: daysFromNow(5),
      }),
      makeTask({
        id: 'nodate-1',
        title: 'No date task',
      }),
    ]

    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)

    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent)
    expect(headingTexts).toContain('Overdue')
    expect(headingTexts).toContain('Today')
    expect(headingTexts).toContain('Upcoming')
    expect(headingTexts).toContain('No Date')

    expect(screen.getByText('Overdue task')).toBeInTheDocument()
    expect(screen.getByText('Today task')).toBeInTheDocument()
    expect(screen.getByText('Future task')).toBeInTheDocument()
    expect(screen.getByText('No date task')).toBeInTheDocument()
  })

  it('excludes archived tasks from grouping', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Active', dueDate: todayStr() }),
      makeTask({ id: '2', title: 'Archived', archived: true, dueDate: todayStr() }),
    ]

    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText('Archived')).not.toBeInTheDocument()
  })

  it('only shows headers for groups that have tasks', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Today only', dueDate: todayStr() }),
    ]

    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)

    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent)
    expect(headingTexts).toContain('Today')
    expect(headingTexts).not.toContain('Overdue')
    expect(headingTexts).not.toContain('Upcoming')
    expect(headingTexts).not.toContain('No Date')
  })

  it('renders list role', () => {
    const tasks = [makeTask({ id: '1', dueDate: todayStr() })]
    render(
      <TaskList tasks={tasks} onToggle={vi.fn()} onRefresh={vi.fn()} />,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
