import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 開発環境で初期データ投入用のスクリプトを読み込む
if (import.meta.env.DEV) {
  import('./utils/initializeSupportSystems.js')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
