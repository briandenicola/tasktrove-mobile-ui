import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { createProjectApi } from '@/api/projects'

const PROJECTS_KEY = ['projects'] as const

export function useProjects() {
  const { client } = useAuth()

  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: ({ signal }) => {
      if (!client) throw new Error('Not authenticated')
      return createProjectApi(client).getProjects(signal)
    },
    enabled: !!client,
    select: (data) => data.projects,
  })
}
