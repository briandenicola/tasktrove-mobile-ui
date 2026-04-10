import { useState, useCallback, useDeferredValue } from 'react'
import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { TaskItemExpandable } from '@/components/tasks/TaskItemExpandable'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useProjects } from '@/hooks/useProjects'

export function SearchPage() {
  const { data: tasks, refetch } = useTasks()
  const { data: labels } = useLabels()
  const { data: projects } = useProjects()
  const completeTask = useCompleteTask()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const filtered = tasks?.filter((t) => {
    if (!deferredQuery.trim()) return false
    const q = deferredQuery.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    )
  }) ?? []

  const handleToggle = useCallback(
    (id: string, completed: boolean) => {
      setPendingIds((prev) => new Set(prev).add(id))
      completeTask.mutate(
        { id, completed },
        {
          onSettled: () => {
            setPendingIds((prev) => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
          },
        },
      )
    },
    [completeTask],
  )

  const handleRefresh = useCallback(() => refetch(), [refetch])

  return (
    <AppShell title="Search">
      <div className="px-4 pt-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-base dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          autoFocus
          aria-label="Search tasks"
        />
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        {deferredQuery.trim() && filtered.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No tasks matching &ldquo;{deferredQuery}&rdquo;</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div role="list" className="px-4 pb-24 pt-2">
            {filtered.map((task) => (
              <TaskItemExpandable
                key={task.id}
                task={task}
                labels={labels}
                projects={projects}
                onToggle={handleToggle}
                onTap={(id) => navigate(`/task/${id}`)}
                loading={pendingIds.has(task.id)}
              />
            ))}
          </div>
        )}

        {!deferredQuery.trim() && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <svg className="mb-4 h-16 w-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-sm text-gray-500">Type to search across all tasks</p>
          </div>
        )}
      </PullToRefresh>

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <BottomNav onAddTap={() => setQuickAddOpen(true)} />
    </AppShell>
  )
}
