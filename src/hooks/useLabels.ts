import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { createLabelApi } from '@/api/labels'

const LABELS_KEY = ['labels'] as const

export function useLabels() {
  const { client } = useAuth()

  return useQuery({
    queryKey: LABELS_KEY,
    queryFn: ({ signal }) => {
      if (!client) throw new Error('Not authenticated')
      return createLabelApi(client).getLabels(signal)
    },
    enabled: !!client,
    select: (data) => data.labels,
  })
}
