import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { build as esbuildBundle } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const _require = createRequire(import.meta.url)

// Bundle simli-client (CJS) into a single ESM file via esbuild so Rollup never
// sees the raw CJS require('./Client') calls that confuse @rollup/plugin-commonjs.
function simliClientEsmPlugin() {
  let cachedBundle = null

  return {
    name: 'simli-client-esm',
    enforce: 'pre',
    async resolveId(id) {
      if (id === 'simli-client') return '\0virtual:simli-client'
    },
    async load(id) {
      if (id !== '\0virtual:simli-client') return
      if (!cachedBundle) {
        let entryPoint
        try {
          entryPoint = _require.resolve('simli-client')
        } catch {
          return 'export {}'
        }
        const result = await esbuildBundle({
          entryPoints: [entryPoint],
          bundle: true,
          format: 'esm',
          platform: 'browser',
          write: false,
          external: ['livekit-client'],
        })
        // esbuild wraps CJS in "export default require_xxx()" — no named exports.
        // Replace the default export with named exports so Rollup can tree-shake properly.
        cachedBundle = result.outputFiles[0].text.replace(
          /^export default (.+);$/m,
          [
            'const __simliPkg = $1;',
            'export default __simliPkg;',
            'export const { SimliClient, LogLevel, generateSimliSessionToken, generateIceServers } = __simliPkg;',
          ].join('\n')
        )
      }
      return { code: cachedBundle, map: null }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), mkcert(), simliClientEsmPlugin()],
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
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
  }
})
