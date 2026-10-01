import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig({ plugins: [react()], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, test: { include: ['tests/**/*.test.{js,jsx}'], exclude: process.env.FIRESTORE_EMULATOR_HOST ? [] : ['tests/rules.test.js'], restoreMocks: true } })
