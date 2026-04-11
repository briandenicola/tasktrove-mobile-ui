import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatDate,
  formatRelativeDate,
  groupTasksByDate,
  getPriorityColor,
  getPriorityLabel,
} from '../../src/lib/utils'
import type { Task } from '../../src/lib/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test task',
    completed: false,
    priority: 4,
    labels: [],
    subtasks: [],
    comments: [],
    createdAt: '2026-01-01T00:00:00Z',
    recurringMode: 'dueDate',
    ...overrides,
  }
}

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('returns empty string for no classes', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-04-09')
    expect(result).toMatch(/Apr/)
    expect(result).toMatch(/9/)
  })
})

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Today" for today', () => {
    expect(formatRelativeDate('2026-04-09')).toBe('Today')
  })

  it('returns "Tomorrow" for tomorrow', () => {
    expect(formatRelativeDate('2026-04-10')).toBe('Tomorrow')
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(formatRelativeDate('2026-04-08')).toBe('Yesterday')
  })

  it('returns "X days ago" for past dates', () => {
    expect(formatRelativeDate('2026-04-06')).toBe('3 days ago')
  })

  it('returns "In X days" for near future', () => {
    expect(formatRelativeDate('2026-04-13')).toBe('In 4 days')
  })
})

describe('groupTasksByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('groups tasks into overdue, today, upcoming, and no-date', () => {
    const tasks = [
      makeTask({ title: 'Overdue', dueDate: '2026-04-07' }),
      makeTask({ title: 'Today', dueDate: '2026-04-09' }),
      makeTask({ title: 'Upcoming', dueDate: '2026-04-15' }),
      makeTask({ title: 'No date' }),
    ]

    const groups = groupTasksByDate(tasks)

    expect(groups).toHaveLength(4)
    expect(groups[0]!.key).toBe('overdue')
    expect(groups[0]!.tasks).toHaveLength(1)
    expect(groups[1]!.key).toBe('today')
    expect(groups[2]!.key).toBe('upcoming')
    expect(groups[3]!.key).toBe('no-date')
  })

  it('excludes completed tasks', () => {
    const tasks = [
      makeTask({ title: 'Done', completed: true, dueDate: '2026-04-09' }),
      makeTask({ title: 'Active', dueDate: '2026-04-09' }),
    ]

    const groups = groupTasksByDate(tasks)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.tasks).toHaveLength(1)
    expect(groups[0]!.tasks[0]!.title).toBe('Active')
  })

  it('excludes archived tasks', () => {
    const tasks = [
      makeTask({ title: 'Archived', archived: true }),
    ]

    const groups = groupTasksByDate(tasks)
    expect(groups).toHaveLength(0)
  })

  it('returns empty array for no tasks', () => {
    expect(groupTasksByDate([])).toEqual([])
  })
})

describe('getPriorityColor', () => {
  it('returns red for priority 1', () => {
    expect(getPriorityColor(1)).toContain('red')
  })

  it('returns orange for priority 2', () => {
    expect(getPriorityColor(2)).toContain('orange')
  })

  it('returns blue for priority 3', () => {
    expect(getPriorityColor(3)).toContain('blue')
  })

  it('returns gray for priority 4', () => {
    expect(getPriorityColor(4)).toContain('gray')
  })
})

describe('getPriorityLabel', () => {
  it('returns High for priority 1', () => {
    expect(getPriorityLabel(1)).toBe('High')
  })

  it('returns Low for priority 4', () => {
    expect(getPriorityLabel(4)).toBe('None')
  })
})
