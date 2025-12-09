import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // 使用IP地址而不是域名，避免DNS解析问题
    port: 5174,
  },
})