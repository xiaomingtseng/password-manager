import { useEffect, useState } from 'react'
import './LoadingScreen.css'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 模擬初始化過程
    const initTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onLoadingComplete, 500) // 等待淡出動畫完成
    }, 2000) // 2秒後開始淡出

    return () => clearTimeout(initTimer)
  }, [onLoadingComplete])

  if (!isVisible) return null

  return (
    <div className={`loading-container ${!isVisible ? 'fade-out' : ''}`}>
      <div className="loading-spinner"></div>
      <div className="loading-text">密碼管理器</div>
      <div className="loading-subtext">正在初始化安全環境...</div>
    </div>
  )
}
