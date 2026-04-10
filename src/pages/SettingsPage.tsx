import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
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
  const navigate = useNavigate()

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

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Update Connection</h2>
          <SetupScreen onConnected={() => navigate('/', { replace: true })} />
        </section>
      </div>

      <BottomNav />
    </AppShell>
  )
}
