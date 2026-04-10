import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolved: 'light' | 'dark'
}

const STORAGE_KEY = 'tasktrove_theme'

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
  resolved: 'light',
})

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  const themeColor = resolved === 'dark' ? '#111827' : '#2563eb'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
}

function subscribeToSystemTheme(callback: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

const modeListeners = new Set<() => void>()
function subscribeToMode(callback: () => void) {
  modeListeners.add(callback)
  return () => { modeListeners.delete(callback) }
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system'
}

function writeStoredMode(m: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, m)
  modeListeners.forEach((cb) => cb())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => 'light' as const)
  const mode = useSyncExternalStore(subscribeToMode, readStoredMode, () => 'system' as const)
  const resolved = mode === 'system' ? systemTheme : mode

  const setMode = useCallback((m: ThemeMode) => {
    writeStoredMode(m)
  }, [])

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
