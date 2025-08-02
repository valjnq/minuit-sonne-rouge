// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/minuit-sonne-rouge/', // très important
  plugins: [react()],
})