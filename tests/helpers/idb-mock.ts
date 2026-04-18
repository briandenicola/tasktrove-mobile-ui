import { vi } from 'vitest'

// Mock IndexedDB for tests
const idbMock = new Map()

export const mockIndexedDB = () => {
  global.indexedDB = {
    open: vi.fn(() => ({
      result: {
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            get: vi.fn((key) => ({ result: idbMock.get(key) })),
            put: vi.fn((value, key) => idbMock.set(key, value)),
            delete: vi.fn((key) => idbMock.delete(key)),
          })),
        })),
      },
      onsuccess: null,
    })),
  } as any

  // Mock idb-keyval functions
  vi.mock('idb-keyval', () => ({
    get: vi.fn((key) => Promise.resolve(idbMock.get(key))),
    set: vi.fn((key, value) => {
      idbMock.set(key, value)
      return Promise.resolve()
    }),
    del: vi.fn((key) => {
      idbMock.delete(key)
      return Promise.resolve()
    }),
  }))
}

export const clearIDBMock = () => {
  idbMock.clear()
}
