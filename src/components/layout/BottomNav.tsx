import { useLocation, useNavigate } from 'react-router'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { data: projects } = useProjects()
  const navigate = useNavigate()
  const location = useLocation()

  const isInbox = location.pathname === '/'
  const activeProjectId = location.pathname.startsWith('/project/')
    ? location.pathname.split('/')[2]
    : null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-sm"
      aria-label="Project navigation"
    >
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 scrollbar-none">
        <button
          type="button"
          onClick={() => navigate('/')}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            isInbox
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100',
          )}
          aria-current={isInbox ? 'page' : undefined}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v3.587a1 1 0 01-.293.707L11.414 10.5l.293.293a1 1 0 01-1.414 0L8 8.5l-2.293 2.293a1 1 0 01-1.414 0l.293-.293L1.293 7.294A1 1 0 011 6.587V3z" />
          </svg>
          Inbox
        </button>

        {projects?.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => navigate(`/project/${project.id}`)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              activeProjectId === project.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100',
            )}
            aria-current={activeProjectId === project.id ? 'page' : undefined}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
            {project.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
