import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useTasks, useCompleteTask } from '@/hooks/useTasks'

export function CompletedPage() {
  const { data: tasks, isLoading } = useTasks()
  const completeTask = useCompleteTask()
  const navigate = useNavigate()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const completedTasks = tasks?.filter((t) => t.completed) ?? []

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

  return (
    <AppShell title="Completed">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading…</p>
        </div>
      )}

      {!isLoading && completedTasks.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <svg className="mb-4 h-16 w-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700">No completed tasks</h2>
          <p className="mt-1 text-sm text-gray-500">Tasks you complete will appear here</p>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div role="list" className="px-4 pb-24">
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onTap={(id) => navigate(`/task/${id}`)}
              loading={pendingIds.has(task.id)}
            />
          ))}
        </div>
      )}

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <BottomNav onAddTap={() => setQuickAddOpen(true)} />
    </AppShell>
  )
}
