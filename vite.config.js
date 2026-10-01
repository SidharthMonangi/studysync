import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), {
    name: 'studysync-local-api',
    configureServer(server) {
      const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
      server.middlewares.use('/api/ai', async (req, res) => {
        const { createHandler } = await import('./api/ai.js')
        res.status = code => { res.statusCode = code; return res }
        res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        try {
          let body = ''
          for await (const chunk of req) {
            body += chunk
            if (body.length > 65000) return res.status(413).json({ error: 'Request is too large.', code: 'INVALID_INPUT' })
          }
          req.body = body
          await createHandler({ env })(req, res)
        } catch { res.status(500).json({ error: 'The local assistant could not complete this request.', code: 'INTERNAL_ERROR' }) }
      })
    },
  }],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
