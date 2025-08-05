import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { PlusIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import type { Password } from '../types/electron'
import { browserPasswordAPI } from '../utils/browserStorage'

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password: result })
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
                    onClick={generatePassword}
                    className="mt-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-sm"
                  >
                    生成
                  </button>
                </div>
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
