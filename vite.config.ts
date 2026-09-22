import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站点部署在 https://<user>.github.io/cs-ai-dashboard/ 子路径，
// dev/preview/build 统一使用同一 base，保证本地与线上行为一致。
export default defineConfig({
  plugins: [react()],
  base: '/cs-ai-dashboard/',
})
