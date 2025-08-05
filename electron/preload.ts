import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback: Function) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  
  // Password management
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  addPassword: (passwordData: any) => ipcRenderer.invoke('add-password', passwordData),
  updatePassword: (id: number, passwordData: any) => ipcRenderer.invoke('update-password', id, passwordData),
  deletePassword: (id: number) => ipcRenderer.invoke('delete-password', id),
  
  // Master password
  checkMasterPassword: () => ipcRenderer.invoke('check-master-password'),
  verifyMasterPassword: (password: string, hash: string) => ipcRenderer.invoke('verify-master-password', password, hash),
  setMasterPassword: (passwordHash: string, salt: string) => ipcRenderer.invoke('set-master-password', passwordHash, salt),
})

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        on(...args: Parameters<typeof ipcRenderer.on>) {
          const [channel, listener] = args
          return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
        },
        off(...args: Parameters<typeof ipcRenderer.off>) {
          const [channel, ...omit] = args
          return ipcRenderer.off(channel, ...omit)
        },
        send(...args: Parameters<typeof ipcRenderer.send>) {
          const [channel, ...omit] = args
          return ipcRenderer.send(channel, ...omit)
        },
        invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
          const [channel, ...omit] = args
          return ipcRenderer.invoke(channel, ...omit)
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ipcRenderer: {
      on: ipcRenderer.on,
      off: ipcRenderer.off,
      send: ipcRenderer.send,
      invoke: ipcRenderer.invoke,
    },
  }
}
