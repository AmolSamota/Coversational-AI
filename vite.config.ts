import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Use base path only for production builds (GitHub Pages)
  // For local development (serve), use '/' so routes work correctly
  const base = command === 'build' ? '/Coversational-AI/' : '/';
  
  return {
    plugins: [react()],
    base,
  };
})
