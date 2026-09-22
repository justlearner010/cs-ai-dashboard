import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// #mig=<base64url> 一次性迁移：解码 {courses, logs, darkMode?} 写入 localStorage 后立刻从地址栏抹掉。
// 数据只落在本机浏览器，base64 片段不会随网络请求发出。
function importFromHash(): void {
  const match = window.location.hash.match(/[#&]mig=([A-Za-z0-9_-]+)/)
  if (!match) return
  try {
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) b64 += '='
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const data = JSON.parse(new TextDecoder().decode(bytes)) as {
      courses?: unknown
      logs?: unknown
      darkMode?: boolean
    }
    if (Array.isArray(data.courses) && Array.isArray(data.logs)) {
      localStorage.setItem('csAiAgentCoursesV3', JSON.stringify(data.courses))
      localStorage.setItem('csAiAgentLogsV3', JSON.stringify(data.logs))
      if (typeof data.darkMode === 'boolean') {
        localStorage.setItem('csAiAgentDarkMode', String(data.darkMode))
      }
    }
  } catch (error) {
    console.warn('Migration import failed:', error)
  } finally {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    )
  }
}

importFromHash()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
