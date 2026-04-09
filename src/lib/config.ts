const STORAGE_KEY_BASE_URL = 'tasktrove_base_url'
const STORAGE_KEY_TOKEN = 'tasktrove_token'

export function getBaseUrl(): string | null {
  return localStorage.getItem(STORAGE_KEY_BASE_URL)
}

export function setBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_BASE_URL, url.replace(/\/+$/, ''))
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, token)
}

export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_BASE_URL)
  localStorage.removeItem(STORAGE_KEY_TOKEN)
}

export function hasCredentials(): boolean {
  return getBaseUrl() !== null && getToken() !== null
}
