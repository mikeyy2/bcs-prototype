import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub repo name exactly so Pages resolves assets.
export default defineConfig({
  base: '/bcs-prototype/',
  plugins: [react()],
})
