import { useParams, useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { useDeleteTask, useTask, useUpdateTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useLabels } from '@/hooks/useLabels'
import type { UpdateTaskInput } from '@/lib/types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading, error } = useTask(id ?? '')
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const { data: projects } = useProjects()
  const { data: labels } = useLabels()

  const handleSave = (changes: Record<string, unknown>) => {
    updateTask.mutate(changes as UpdateTaskInput, {
      onSuccess: () => navigate(-1),
    })
  }

  const handleDelete = () => {
    if (!id) throw new Error('Cannot delete task without an id')
    if (!window.confirm('Delete this task?')) return

    deleteTask.mutate(id, {
      onSuccess: () => navigate(-1),
    })
  }

  return (
    <AppShell
      headerRight={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-gray-800 dark:hover:text-blue-300"
            aria-label="Back"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!id || deleteTask.isPending}
            className="flex h-11 w-11 items-center justify-center rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-gray-800 dark:hover:text-red-300"
            aria-label="Delete task"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          </button>
        </div>
      }
    >
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading task…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-red-600 dark:text-red-400">Task not found</p>
        </div>
      )}

      {task && (
        <TaskDetail
          key={task.id}
          task={task}
          labels={labels}
          projects={projects}
          onSave={handleSave}
          saving={updateTask.isPending}
        />
      )}
    </AppShell>
  )
}
