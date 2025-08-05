import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MasterPasswordSetup, MasterPasswordLogin, PasswordManager } from './components'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

function App() {
  const { isAuthenticated, hasMasterPassword, checkMasterPassword } = useAuthStore()

  // 初始化時檢查主密碼
  useEffect(() => {
    checkMasterPassword()
  }, [checkMasterPassword])

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
