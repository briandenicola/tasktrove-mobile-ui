import { useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { useTasksByProject, useCompleteTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/layout/BottomNav'

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tasks, isLoading, error, refetch } = useTasksByProject(id ?? '')
  const { data: projects } = useProjects()
  const completeTask = useCompleteTask()
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
    <AppShell title={project?.name ?? 'Project'}>
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading tasks…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <p className="text-sm text-red-600 dark:text-red-400">Failed to load tasks</p>
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
      <BottomNav onAddTap={() => setQuickAddOpen(true)} />
    </AppShell>
  )
}
