import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), mkcert()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      global: 'globalThis',
      'process.env': {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          render: path.resolve(__dirname, 'render.html'),
          renderApplication: path.resolve(__dirname, 'render-application.html'),
        },
      },
    },
    server: {
      https: false,
      host: 'localhost',
      // open: true,
      port: 3000,
      // proxy: {
      //   '/api': {
      //     // dùng env ở đây là được
      //     target: env.VITE_API_BASE_URL || 'http://localhost:5000',
      //     changeOrigin: true,
      //   },
      // },
      allowedHosts: true,
    },
  }
})
