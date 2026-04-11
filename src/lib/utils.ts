import type { Task, TaskGroup, DateGroup, Priority } from './types'

// --- Class name merger ---

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// --- Date formatting ---

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(dateStr: string): string {
  const today = startOfDay(new Date())
  const target = new Date(dateStr + 'T00:00:00')
  const diffMs = target.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
  if (diffDays <= 7) return `In ${diffDays} days`
  return formatDate(dateStr)
}

export function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// --- Date helpers ---

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDateGroup(dueDate: string | undefined): DateGroup {
  if (!dueDate) return 'no-date'

  const today = startOfDay(new Date())
  const due = new Date(dueDate + 'T00:00:00')

  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

const GROUP_LABELS: Record<DateGroup, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  'no-date': 'No Date',
}

const GROUP_ORDER: DateGroup[] = ['overdue', 'today', 'upcoming', 'no-date']

export function groupTasksByDate(tasks: Task[]): TaskGroup[] {
  const grouped = new Map<DateGroup, Task[]>()

  for (const task of tasks) {
    if (task.completed || task.archived) continue
    const group = getDateGroup(task.dueDate)
    const existing = grouped.get(group) ?? []
    existing.push(task)
    grouped.set(group, existing)
  }

  return GROUP_ORDER
    .filter((key) => grouped.has(key))
    .map((key) => ({
      key,
      label: GROUP_LABELS[key],
      tasks: grouped.get(key)!,
    }))
}

export function filterTodayTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => {
      if (t.completed || t.archived) return false
      return getDateGroup(t.dueDate) === 'today' || getDateGroup(t.dueDate) === 'overdue'
    })
    .sort((a, b) => a.priority - b.priority)
}

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.priority - b.priority)
}

function formatDayLabel(dateStr: string): string {
  const today = startOfDay(new Date())
  const date = new Date(dateStr + 'T00:00:00')
  const diffMs = date.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === -1) return 'Yesterday'
  if (diffDays === 1) return 'Tomorrow'

  const dayName = date.toLocaleDateString(undefined, { weekday: 'long' })

  if (diffDays >= 2 && diffDays <= 6) return dayName
  if (diffDays < -1 && diffDays >= -6) return `Last ${dayName}`

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function groupUpcomingByDay(tasks: Task[]): TaskGroup[] {
  const overdue: Map<string, Task[]> = new Map()
  const upcoming: Map<string, Task[]> = new Map()
  const noDate: Task[] = []

  for (const task of tasks) {
    if (task.completed || task.archived) continue
    const group = getDateGroup(task.dueDate)
    if (group === 'today') continue

    if (!task.dueDate) {
      noDate.push(task)
    } else {
      const bucket = group === 'overdue' ? overdue : upcoming
      const existing = bucket.get(task.dueDate) ?? []
      existing.push(task)
      bucket.set(task.dueDate, existing)
    }
  }

  const result: TaskGroup[] = []

  // Overdue days — most recent first
  const overdueDays = [...overdue.keys()].sort((a, b) => b.localeCompare(a))
  for (const day of overdueDays) {
    result.push({
      key: `overdue-${day}`,
      label: `${formatDayLabel(day)} — Overdue`,
      tasks: sortByPriority(overdue.get(day)!),
    })
  }

  // Upcoming days — soonest first
  const upcomingDays = [...upcoming.keys()].sort((a, b) => a.localeCompare(b))
  for (const day of upcomingDays) {
    result.push({
      key: `upcoming-${day}`,
      label: formatDayLabel(day),
      tasks: sortByPriority(upcoming.get(day)!),
    })
  }

  // No date at the end
  if (noDate.length > 0) {
    result.push({
      key: 'no-date',
      label: 'No Date',
      tasks: sortByPriority(noDate),
    })
  }

  return result
}

// --- Priority ---

const PRIORITY_COLORS: Record<Priority, string> = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-blue-500',
  4: 'text-gray-400',
}

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority]
}

const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
  4: 'None',
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority]
}
