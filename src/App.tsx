import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { MasterPasswordSetup, MasterPasswordLogin, PasswordManager } from './components'
import { useAuthStore } from './stores/authStore'
import { useEffect, useState } from 'react'

function App() {
  const { isAuthenticated, hasMasterPassword, checkMasterPassword } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化時檢查主密碼
  useEffect(() => {
    const initializeApp = async () => {
      console.log('應用程式初始化開始')
      
      // 如果是 Electron 環境，等待一下確保 API 準備好
      if (window.electronAPI) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      await checkMasterPassword()
      setIsInitialized(true)
      console.log('應用程式初始化完成')
    }
    
    initializeApp()
  }, [checkMasterPassword])

  // 顯示載入畫面直到初始化完成
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化密碼管理器...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route 
            path="/" 
            element={
              !hasMasterPassword ? (
                <MasterPasswordSetup />
              ) : !isAuthenticated ? (
                <MasterPasswordLogin />
              ) : (
                <PasswordManager />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
