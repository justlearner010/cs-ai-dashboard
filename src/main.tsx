import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import { ToastProvider } from './hooks/useToast'
import { applyMotionCssVars } from './motion/tokens'
import './index.css'

applyMotionCssVars()

const COURSES_KEY = 'csAiAgentCoursesV3'
const LOGS_KEY = 'csAiAgentLogsV3'
const DARK_KEY = 'csAiAgentDarkMode'

// 覆盖前把现有非空数据复制一份到 *.premig，只保留首次备份
function backupPreMig(key: string): void {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return
    if (localStorage.getItem(`${key}.premig`) !== null) return
    localStorage.setItem(`${key}.premig`, raw)
  } catch {
    // 备份失败时不阻断迁移
  }
}

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
    const { courses, logs } = data
    if (!Array.isArray(courses) || !Array.isArray(logs)) {
      throw new Error('mig payload must contain courses[] and logs[]')
    }
    const coursesValid = courses.every(
      c =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as { id?: unknown }).id === 'string' &&
        Array.isArray((c as { todos?: unknown }).todos),
    )
    if (!coursesValid) {
      throw new Error('mig courses have invalid shape')
    }
    backupPreMig(COURSES_KEY)
    backupPreMig(LOGS_KEY)
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
    if (typeof data.darkMode === 'boolean') {
      localStorage.setItem(DARK_KEY, String(data.darkMode))
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
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <App />
      </ToastProvider>
    </MotionConfig>
  </StrictMode>,
)
