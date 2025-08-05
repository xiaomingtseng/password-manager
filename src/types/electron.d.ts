export interface ElectronAPI {
  onUpdateCounter: (callback: Function) => Electron.IpcRenderer
  getPasswords: () => Promise<Password[]>
  addPassword: (passwordData: Omit<Password, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updatePassword: (id: number, passwordData: Omit<Password, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  deletePassword: (id: number) => Promise<boolean>
  checkMasterPassword: () => Promise<boolean>
  verifyMasterPassword: (password: string, hash: string) => Promise<boolean>
  setMasterPassword: (passwordHash: string, salt: string) => Promise<boolean>
}

export interface Password {
  id: number
  title: string
  username?: string
  password: string
  url?: string
  notes?: string
  created_at: string
  updated_at: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: {
      ipcRenderer: {
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => () => void
        off: (channel: string, listener: (...args: any[]) => void) => void
        send: (channel: string, ...args: any[]) => void
        invoke: (channel: string, ...args: any[]) => Promise<any>
      }
    }
  }
}
