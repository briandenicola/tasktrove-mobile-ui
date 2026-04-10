import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { TaskList } from '@/components/tasks/TaskList'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { useTasks, useCompleteTask, useUpdateTask } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useProjects } from '@/hooks/useProjects'
import { groupUpcomingByDay } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function UpcomingPage() {
  const { data: tasks, isLoading, error, refetch } = useTasks()
  const { data: labels } = useLabels()
  const { data: projects } = useProjects()
  const completeTask = useCompleteTask()
  const updateTask = useUpdateTask()
  const navigate = useNavigate()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const dayGroups = tasks ? groupUpcomingByDay(tasks) : []
  const allUpcoming = dayGroups.flatMap((g) => g.tasks)

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

  const handleSubtaskToggle = useCallback(
    (taskId: string, subtaskId: string, completed: boolean) => {
      const task = tasks?.find((t) => t.id === taskId)
      if (!task) return
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed } : s,
      )
      updateTask.mutate({ id: taskId, subtasks: updatedSubtasks })
    },
    [tasks, updateTask],
  )

  const handleRefresh = useCallback(() => {
    return refetch()
  }, [refetch])

  const handleTap = useCallback(
    (id: string) => navigate(`/task/${id}`),
    [navigate],
  )

  return (
    <AppShell title="Upcoming">
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
          tasks={allUpcoming}
          groups={dayGroups}
          labels={labels}
          projects={projects}
          onToggle={handleToggle}
          onSubtaskToggle={handleSubtaskToggle}
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
