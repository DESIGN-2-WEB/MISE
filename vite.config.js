import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Makes `vite preview` serve the prerendered pages the way a static host does:
 * /about → dist/about/index.html, and anything unknown → dist/404.html.
 */
function prerenderedPreview() {
  return {
    name: 'mise-prerendered-preview',
    configurePreviewServer(server) {
      const distDir = path.resolve('dist')
      server.middlewares.use((req, res, next) => {
        const [pathname, query = ''] = req.url.split('?')
        if (req.method === 'GET' && !path.extname(pathname)) {
          const page = path.join(distDir, pathname, 'index.html')
          if (existsSync(page)) {
            req.url = `${path.posix.join(pathname, 'index.html')}${query && `?${query}`}`
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' })
            res.end(readFileSync(path.join(distDir, '404.html')))
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), prerenderedPreview()],
  // Honour a PORT assigned by the environment; otherwise use Vite's defaults.
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
  preview: { port: process.env.PORT ? Number(process.env.PORT) : 4173 },
  build: {
    // The server build is only used to prerender pages, so it doesn't need public/.
    copyPublicDir: !isSsrBuild,
  },
}))
