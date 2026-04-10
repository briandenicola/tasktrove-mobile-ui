import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useProjects } from '@/hooks/useProjects'
import { getDefaultProject, setDefaultProject, getDefaultAssignee, setDefaultAssignee } from '@/lib/config'
import { cn } from '@/lib/utils'

type ThemeMode = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large' | 'xlarge'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
]

const FONT_OPTIONS: { value: FontSize; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'medium', label: 'Medium', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
  { value: 'xlarge', label: 'XL', preview: 'Aa' },
]

export function SettingsPage() {
  const { baseUrl } = useAuth()
  const { mode, setMode, fontSize, setFontSize } = useTheme()
  const { data: projects } = useProjects()
  const navigate = useNavigate()

  const [defaultProjectId, setDefaultProjectId] = useState(() => getDefaultProject() ?? '')
  const [assigneeId, setAssigneeId] = useState(() => getDefaultAssignee() ?? '')

  const handleProjectChange = (value: string) => {
    setDefaultProjectId(value)
    setDefaultProject(value)
  }

  const handleAssigneeChange = (value: string) => {
    setAssigneeId(value)
    setDefaultAssignee(value)
  }

  return (
    <AppShell title="Settings">
      <div className="flex flex-1 flex-col px-4 pb-24 pt-4">
        <section className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Connected to</h2>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{baseUrl ?? 'Not connected'}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Theme</h2>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                  mode === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
                aria-pressed={mode === opt.value}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Font Size</h2>
          <div className="flex gap-2">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFontSize(opt.value)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-3 font-medium transition-colors',
                  fontSize === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
                aria-pressed={fontSize === opt.value}
              >
                <span style={{ fontSize: { small: '14px', medium: '16px', large: '18px', xlarge: '20px' }[opt.value] }}>
                  {opt.preview}
                </span>
                <span className="text-[11px]">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Task Defaults</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="default-project" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Project
              </label>
              <select
                id="default-project"
                value={defaultProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">None</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="default-assignee" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Assignee ID
              </label>
              <input
                id="default-assignee"
                type="text"
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                placeholder="UUID of default assignee"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Used as both owner and assignee on new tasks</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Update Connection</h2>
          <SetupScreen onConnected={() => navigate('/', { replace: true })} />
        </section>
      </div>

      <BottomNav />
    </AppShell>
  )
}
