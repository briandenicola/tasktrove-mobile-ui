import { useParams, useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { useTask, useUpdateTask } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useLabels } from '@/hooks/useLabels'
import type { UpdateTaskInput } from '@/lib/types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading, error } = useTask(id ?? '')
  const updateTask = useUpdateTask()
  const { data: projects } = useProjects()
  const { data: labels } = useLabels()

  const handleSave = (changes: Record<string, unknown>) => {
    updateTask.mutate(changes as UpdateTaskInput, {
      onSuccess: () => navigate(-1),
    })
  }

  return (
    <AppShell
      headerRight={
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:text-blue-700"
          aria-label="Back"
        >
          ← Back
        </button>
      }
    >
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading task…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-red-600">Task not found</p>
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
