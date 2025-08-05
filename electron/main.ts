import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

// The built directory structure
//
// ├─┬─┬ dist
//   │ │ └── index.html
//   │ │
//   │ ├─┬ dist-electron
//   │ │ ├── main.js
//   │ │ └── preload.js
//   │
process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

// Database setup
let dataPath: string
let passwords: any[] = []
let masterPasswordData: any = null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(join(process.env.DIST || '', 'index.html'))
  }
}

// Initialize database
async function initDatabase() {
  dataPath = app.isPackaged 
    ? join(process.resourcesPath, 'data')
    : join(__dirname, '../data')
  
  try {
    await fs.mkdir(dataPath, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }

  // Load passwords
  try {
    const passwordsData = await fs.readFile(join(dataPath, 'passwords.json'), 'utf8')
    passwords = JSON.parse(passwordsData)
  } catch (error) {
    passwords = []
  }

  // Load master password
  try {
    const masterData = await fs.readFile(join(dataPath, 'master.json'), 'utf8')
    masterPasswordData = JSON.parse(masterData)
  } catch (error) {
    masterPasswordData = null
  }
}

async function savePasswords() {
  await fs.writeFile(join(dataPath, 'passwords.json'), JSON.stringify(passwords, null, 2))
}

async function saveMasterPassword() {
  await fs.writeFile(join(dataPath, 'master.json'), JSON.stringify(masterPasswordData, null, 2))
}

// IPC handlers
ipcMain.handle('get-passwords', () => {
  return passwords
})

ipcMain.handle('add-password', async (event, passwordData) => {
  const newPassword = {
    id: Date.now(),
    ...passwordData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  passwords.push(newPassword)
  await savePasswords()
  return true
})

ipcMain.handle('update-password', async (event, id, passwordData) => {
  const index = passwords.findIndex(p => p.id === id)
  if (index !== -1) {
    passwords[index] = {
      ...passwords[index],
      ...passwordData,
      updated_at: new Date().toISOString()
    }
    await savePasswords()
    return true
  }
  return false
})

ipcMain.handle('delete-password', async (event, id) => {
  const index = passwords.findIndex(p => p.id === id)
  if (index !== -1) {
    passwords.splice(index, 1)
    await savePasswords()
    return true
  }
  return false
})

ipcMain.handle('check-master-password', () => {
  return masterPasswordData !== null
})

ipcMain.handle('verify-master-password', (event, password, hash) => {
  // This will be implemented with bcrypt in the renderer process
  return true
})

ipcMain.handle('set-master-password', async (event, passwordHash, salt) => {
  masterPasswordData = {
    password_hash: passwordHash,
    salt: salt,
    created_at: new Date().toISOString()
  }
  await saveMasterPassword()
  return true
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  await initDatabase()
  createWindow()
})
