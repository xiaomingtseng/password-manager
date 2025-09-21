import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

// 防止多個實例啟動
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 當嘗試啟動第二個實例時，聚焦到現有視窗
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

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
  // 防止重複創建視窗
  if (win) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // 延遲顯示，等內容載入完成
    icon: join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // 避免背景節流影響性能
      spellcheck: false, // 關閉拼字檢查加速載入
    },
  })

  // 當頁面準備好時才顯示視窗（避免白屏）
  win.once('ready-to-show', () => {
    console.log('視窗準備完成，顯示應用程式')
    win?.show()
    win?.focus()
  })

  // 視窗關閉事件
  win.on('closed', () => {
    console.log('視窗已關閉')
    win = null
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    console.log('頁面載入完成')
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
  // 修正資料目錄路徑 - 使用用戶資料目錄
  dataPath = app.isPackaged 
    ? app.getPath('userData')  // 生產環境：用戶資料目錄（可寫入）
    : join(__dirname, '../data')  // 開發環境：專案目錄
  
  console.log('資料目錄路徑:', dataPath)
  
  try {
    await fs.mkdir(dataPath, { recursive: true })
    console.log('資料目錄建立成功')
  } catch (error) {
    console.error('資料目錄建立失敗:', error)
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

// 確保只註冊一次 IPC handlers
let ipcHandlersRegistered = false

function registerIpcHandlers() {
  if (ipcHandlersRegistered) {
    console.log('IPC handlers 已經註冊過了，跳過')
    return
  }

  console.log('註冊 IPC handlers')
  
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
    const result = masterPasswordData !== null
    console.log('檢查主密碼請求, 結果:', result)
    return result
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

  ipcHandlersRegistered = true
}

// 應用程式事件 - 只註冊一次
app.on('window-all-closed', () => {
  console.log('所有視窗已關閉')
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  console.log('應用程式被激活')
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 主要初始化邏輯 - 只執行一次
app.whenReady().then(async () => {
  console.log('應用程式準備就緒，開始初始化')
  
  try {
    await initDatabase()
    registerIpcHandlers()
    createWindow()
    console.log('應用程式初始化完成')
  } catch (error) {
    console.error('應用程式初始化失敗:', error)
    app.quit()
  }
})
