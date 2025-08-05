// 瀏覽器環境下的密碼存儲
import type { Password } from '../types/electron'

const STORAGE_KEY = 'passwords'

export const browserPasswordAPI = {
  getPasswords: (): Password[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  addPassword: (passwordData: Omit<Password, 'id' | 'created_at' | 'updated_at'>): boolean => {
    try {
      const passwords = browserPasswordAPI.getPasswords()
      const newPassword: Password = {
        id: Date.now(),
        ...passwordData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      passwords.push(newPassword)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords))
      return true
    } catch {
      return false
    }
  },

  updatePassword: (id: number, passwordData: Omit<Password, 'id' | 'created_at' | 'updated_at'>): boolean => {
    try {
      const passwords = browserPasswordAPI.getPasswords()
      const index = passwords.findIndex(p => p.id === id)
      if (index !== -1) {
        passwords[index] = {
          ...passwords[index],
          ...passwordData,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  deletePassword: (id: number): boolean => {
    try {
      const passwords = browserPasswordAPI.getPasswords()
      const filtered = passwords.filter(p => p.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch {
      return false
    }
  }
}
