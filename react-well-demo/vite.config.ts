import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs'
const env = import.meta.env

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), commonjs()],
  server: {
    port: 4200,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [],
    }
  },
  define: {
    'process.env.': env
  }
})