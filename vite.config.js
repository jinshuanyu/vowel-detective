import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vowel-detective/',   // 一定要這個，才不會空白
  build: { target: ['es2017', 'safari13'] }
})
