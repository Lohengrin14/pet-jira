import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // На GitHub Pages сайт живёт по адресу /pet-jira/, локально в корне
  base: command === 'build' ? '/pet-jira/' : '/',
}))
