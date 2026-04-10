import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large' | 'xlarge'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolved: 'light' | 'dark'
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const THEME_KEY = 'tasktrove_theme'
const FONT_KEY = 'tasktrove_font_size'

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
  resolved: 'light',
  fontSize: 'medium',
  setFontSize: () => {},
})

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  const themeColor = resolved === 'dark' ? '#111827' : '#2563eb'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
}

function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size]
}

function subscribeToSystemTheme(callback: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

const settingsListeners = new Set<() => void>()
function subscribeToSettings(callback: () => void) {
  settingsListeners.add(callback)
  return () => { settingsListeners.delete(callback) }
}
function notifySettings() {
  settingsListeners.forEach((cb) => cb())
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY)
  return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system'
}

function readStoredFontSize(): FontSize {
  const stored = localStorage.getItem(FONT_KEY)
  return (stored === 'small' || stored === 'medium' || stored === 'large' || stored === 'xlarge') ? stored : 'medium'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => 'light' as const)
  const mode = useSyncExternalStore(subscribeToSettings, readStoredMode, () => 'system' as const)
  const fontSize = useSyncExternalStore(subscribeToSettings, readStoredFontSize, () => 'medium' as const)
  const resolved = mode === 'system' ? systemTheme : mode

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(THEME_KEY, m)
    notifySettings()
  }, [])

  const setFontSize = useCallback((s: FontSize) => {
    localStorage.setItem(FONT_KEY, s)
    notifySettings()
  }, [])

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  useEffect(() => {
    applyFontSize(fontSize)
  }, [fontSize])

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolved, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
