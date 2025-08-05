import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import type { Password } from '../types/electron'
import { browserPasswordAPI } from '../utils/browserStorage'
import { PasswordGenerator, DEFAULT_PASSWORD_OPTIONS, PASSWORD_PRESETS } from '../utils/passwordGenerator'
import type { PasswordOptions } from '../utils/passwordGenerator'

export function PasswordManager() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())
  const { logout } = useAuthStore()

  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  })

  // 密碼生成選項
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS)

  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)

  useEffect(() => {
    loadPasswords()
  }, [])

  const loadPasswords = async () => {
    if (window.electronAPI) {
      // Electron 環境
      const data = await window.electronAPI.getPasswords()
      setPasswords(data)
    } else {
      // 瀏覽器環境
      const data = browserPasswordAPI.getPasswords()
      setPasswords(data)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    let success = false
    
    if (window.electronAPI) {
      // Electron 環境
      if (editingPassword) {
        success = await window.electronAPI.updatePassword(editingPassword.id, formData)
      } else {
        success = await window.electronAPI.addPassword(formData)
      }
    } else {
      // 瀏覽器環境
      if (editingPassword) {
        success = browserPasswordAPI.updatePassword(editingPassword.id, formData)
      } else {
        success = browserPasswordAPI.addPassword(formData)
      }
    }
    
    if (success) {
      setShowForm(false)
      setEditingPassword(null)
      setFormData({ title: '', username: '', password: '', url: '', notes: '' })
      loadPasswords()
    }
  }

  const handleEdit = (password: Password) => {
    setEditingPassword(password)
    setFormData({
      title: password.title,
      username: password.username || '',
      password: password.password,
      url: password.url || '',
      notes: password.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('確定要刪除這個密碼嗎？')) {
      let success = false
      
      if (window.electronAPI) {
        // Electron 環境
        success = await window.electronAPI.deletePassword(id)
      } else {
        // 瀏覽器環境
        success = browserPasswordAPI.deletePassword(id)
      }
      
      if (success) {
        loadPasswords()
      }
    }
  }

  const togglePasswordVisibility = (id: number) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisiblePasswords(newVisible)
  }

  const generatePassword = () => {
    const password = PasswordGenerator.generate(passwordOptions)
    setFormData({ ...formData, password })
  }

  const applyPreset = (preset: PasswordOptions) => {
    setPasswordOptions(preset)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">密碼管理器</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                新增密碼
              </button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {passwords.map((password) => (
                <li key={password.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {password.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {password.username}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <input
                              type={visiblePasswords.has(password.id) ? 'text' : 'password'}
                              value={password.password}
                              readOnly
                              className="text-sm text-gray-900 bg-transparent border-none focus:outline-none"
                            />
                            <button
                              onClick={() => togglePasswordVisibility(password.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {visiblePasswords.has(password.id) ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => handleEdit(password)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(password.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {password.url && (
                        <p className="text-sm text-gray-500 mt-1">
                          <a href={password.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            {password.url}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPassword ? '編輯密碼' : '新增密碼'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">標題</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">用戶名</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">密碼</label>
                <div className="flex">
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                    className="mt-1 px-3 py-2 border border-l-0 border-r-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm"
                    title="密碼生成選項"
                  >
                    ⚙️
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="mt-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-sm"
                  >
                    生成
                  </button>
                </div>
                
                {/* 密碼生成器選項 */}
                {showPasswordGenerator && (
                  <div className="mt-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">密碼生成選項</h4>
                    
                    {/* 快速預設 */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">快速預設</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => applyPreset(PASSWORD_PRESETS.simple)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          簡單 (8位)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(PASSWORD_PRESETS.standard)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          標準 (12位)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(PASSWORD_PRESETS.strong)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          強密碼 (20位)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(PASSWORD_PRESETS.numeric)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          純數字 (6位)
                        </button>
                      </div>
                    </div>
                    
                    {/* 密碼長度 */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        長度: {passwordOptions.length}
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="64"
                        value={passwordOptions.length}
                        onChange={(e) => setPasswordOptions({
                          ...passwordOptions,
                          length: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>4</span>
                        <span>64</span>
                      </div>
                    </div>

                    {/* 字符類型選項 */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={passwordOptions.includeUppercase}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            includeUppercase: e.target.checked
                          })}
                          className="mr-2"
                        />
                        大寫字母 (A-Z)
                      </label>
                      
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={passwordOptions.includeLowercase}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            includeLowercase: e.target.checked
                          })}
                          className="mr-2"
                        />
                        小寫字母 (a-z)
                      </label>
                      
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={passwordOptions.includeNumbers}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            includeNumbers: e.target.checked
                          })}
                          className="mr-2"
                        />
                        數字 (0-9)
                      </label>
                      
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={passwordOptions.includeSymbols}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            includeSymbols: e.target.checked
                          })}
                          className="mr-2"
                        />
                        符號
                      </label>
                    </div>

                    {/* 排除相似字符選項 */}
                    <div className="mb-3">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={passwordOptions.excludeSimilar}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            excludeSimilar: e.target.checked
                          })}
                          className="mr-2"
                        />
                        排除相似字符 (0, O, l, 1, I)
                      </label>
                    </div>

                    {/* 自定義符號 */}
                    {passwordOptions.includeSymbols && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          自定義符號
                        </label>
                        <input
                          type="text"
                          value={passwordOptions.customSymbols}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            customSymbols: e.target.value
                          })}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="輸入要使用的符號..."
                        />
                      </div>
                    )}

                    {/* 密碼強度指示器 */}
                    <div className="mb-2">
                      {(() => {
                        const strength = PasswordGenerator.calculateStrength(passwordOptions)
                        const entropy = PasswordGenerator.estimateEntropy(passwordOptions)
                        
                        return (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600">密碼強度</span>
                              <span className={`text-xs font-medium ${
                                strength.level === 'weak' ? 'text-red-600' :
                                strength.level === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {strength.level === 'weak' ? '弱' :
                                 strength.level === 'medium' ? '中' : '強'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  strength.level === 'weak' ? 'bg-red-500 w-1/3' :
                                  strength.level === 'medium' ? 'bg-yellow-500 w-2/3' :
                                  'bg-green-500 w-full'
                                }`}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              熵值: {entropy.toFixed(1)} bits
                            </div>
                            {strength.feedback.length > 0 && (
                              <div className="text-xs text-gray-600">
                                {strength.feedback.map((feedback, index) => (
                                  <div key={index} className="mb-1">• {feedback}</div>
                                ))}
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">網址</label>
                <input
                  type="url"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">備註</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPassword(null)
                    setFormData({ title: '', username: '', password: '', url: '', notes: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingPassword ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
