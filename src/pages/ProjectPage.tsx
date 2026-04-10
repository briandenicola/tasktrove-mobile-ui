import { useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { useTasksByProject, useCompleteTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/layout/BottomNav'

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tasks, isLoading, error, refetch } = useTasksByProject(id ?? '')
  const { data: projects } = useProjects()
  const completeTask = useCompleteTask()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const project = projects?.find((p) => p.id === id)

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

  const handleRefresh = useCallback(() => {
    return refetch()
  }, [refetch])

  const handleTap = useCallback(
    (taskId: string) => navigate(`/task/${taskId}`),
    [navigate],
  )

  return (
    <AppShell
      title={project?.name ?? 'Project'}
      headerRight={
        <button
          type="button"
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      }
      fab={
        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          className="mb-14 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Add task"
        >
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      }
    >
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading tasks…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-sm text-red-600">Failed to load tasks</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {tasks && (
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onTap={handleTap}
          onRefresh={handleRefresh}
          pendingIds={pendingIds}
        />
      )}

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <BottomNav />
    </AppShell>
  )
}
