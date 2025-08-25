import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vowel-detective/',      // 你的 GitHub Pages 路徑
  build: {
    target: ['es2017', 'safari13'] // 轉舊一點，避免 FB/內建瀏覽器白頁
  }
})
