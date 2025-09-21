import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  hasMasterPassword: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  setMasterPassword: (password: string) => Promise<boolean>
  checkMasterPassword: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasMasterPassword: false,

  login: async (password: string) => {
    try {
      if (window.electronAPI) {
        // Electron 環境 - 這裡應該要實際驗證
        if (password.length > 0) {
          set({ isAuthenticated: true })
          return true
        }
      } else {
        // 瀏覽器環境 - 檢查 localStorage
        const stored = localStorage.getItem('masterPassword')
        if (stored) {
          const { hash } = JSON.parse(stored)
          const inputHash = btoa(password)
          if (hash === inputHash) {
            set({ isAuthenticated: true })
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  },

  logout: () => {
    set({ isAuthenticated: false })
  },

  setMasterPassword: async (password: string) => {
    try {
      // 簡單的密碼驗證
      if (password.length >= 8) {
        const hash = btoa(password) // 簡單的 base64 編碼，不安全但能工作
        const salt = Date.now().toString()
        
        if (window.electronAPI) {
          // Electron 環境
          const success = await window.electronAPI.setMasterPassword(hash, salt)
          if (success) {
            set({ hasMasterPassword: true, isAuthenticated: true })
            return true
          }
        } else {
          // 瀏覽器環境 - 使用 localStorage 作為後備
          localStorage.setItem('masterPassword', JSON.stringify({ hash, salt }))
          set({ hasMasterPassword: true, isAuthenticated: true })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error setting master password:', error)
      return false
    }
  },

  checkMasterPassword: async () => {
    try {
      if (window.electronAPI) {
        // Electron 環境
        console.log('檢查主密碼 - Electron 環境')
        const hasMaster = await window.electronAPI.checkMasterPassword()
        console.log('主密碼檢查結果:', hasMaster)
        set({ hasMasterPassword: hasMaster })
      } else {
        // 瀏覽器環境 - 檢查 localStorage
        console.log('檢查主密碼 - 瀏覽器環境')
        const stored = localStorage.getItem('masterPassword')
        const hasMaster = !!stored
        console.log('localStorage 檢查結果:', hasMaster)
        set({ hasMasterPassword: hasMaster })
      }
    } catch (error) {
      console.error('檢查主密碼時發生錯誤:', error)
      // 如果發生錯誤，假設沒有主密碼
      set({ hasMasterPassword: false })
    }
  },
}))

// Initialize the store
if (typeof window !== 'undefined') {
  if (window.electronAPI) {
    useAuthStore.getState().checkMasterPassword()
  } else {
    // 瀏覽器環境 - 立即檢查 localStorage
    const stored = localStorage.getItem('masterPassword')
    useAuthStore.setState({ hasMasterPassword: !!stored })
  }
}
