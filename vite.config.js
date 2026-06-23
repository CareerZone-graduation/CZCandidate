import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pre-resolve simli-client's dist dir so the custom plugin can fix CJS proxy resolution.
// @rollup/plugin-commonjs creates virtual modules like "./Client?commonjs-external" with
// relative paths, then fails to resolve "./Client" from those virtual paths on Linux.
const _require = createRequire(import.meta.url)
let simliClientDistDir = ''
try {
  simliClientDistDir = path.dirname(_require.resolve('simli-client'))
} catch {}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      mkcert(),
      {
        name: 'fix-simli-cjs',
        enforce: 'pre',
        resolveId(source, importer) {
          if (
            simliClientDistDir &&
            source === './Client' &&
            importer?.includes('commonjs-external')
          ) {
            return path.resolve(simliClientDistDir, 'Client.js')
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      global: 'globalThis',
      'process.env': {},
    },
    optimizeDeps: {
      include: ['simli-client'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
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
      host: '0.0.0.0',
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
