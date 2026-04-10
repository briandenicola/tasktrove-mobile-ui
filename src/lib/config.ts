const STORAGE_KEY_BASE_URL = 'tasktrove_base_url'
const STORAGE_KEY_TOKEN = 'tasktrove_token'
const STORAGE_KEY_DEFAULT_PROJECT = 'tasktrove_default_project'
const STORAGE_KEY_DEFAULT_ASSIGNEE = 'tasktrove_default_assignee'

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

export function getDefaultProject(): string | null {
  return localStorage.getItem(STORAGE_KEY_DEFAULT_PROJECT)
}

export function setDefaultProject(projectId: string): void {
  if (projectId) {
    localStorage.setItem(STORAGE_KEY_DEFAULT_PROJECT, projectId)
  } else {
    localStorage.removeItem(STORAGE_KEY_DEFAULT_PROJECT)
  }
}

export function getDefaultAssignee(): string | null {
  return localStorage.getItem(STORAGE_KEY_DEFAULT_ASSIGNEE)
}

export function setDefaultAssignee(assigneeId: string): void {
  if (assigneeId) {
    localStorage.setItem(STORAGE_KEY_DEFAULT_ASSIGNEE, assigneeId)
  } else {
    localStorage.removeItem(STORAGE_KEY_DEFAULT_ASSIGNEE)
  }
}
