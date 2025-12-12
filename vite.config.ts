import * as path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const esHost = env.ES_HOST || 'https://localhost:9200'
  const esUsername = env.ES_USERNAME || 'elastic'
  const esPassword = env.ES_PASSWORD || ''

  return {
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      EnvironmentPlugin({ REACT_APP_TEXT: 'My Spotify Listening Habits' }),
    ],
    publicDir: 'public',
    server: {
      host: '127.0.0.1',
      port: 3000,
      proxy: {
        '/api/es': {
          target: esHost,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/es/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const auth = Buffer.from(`${esUsername}:${esPassword}`).toString(
                'base64',
              )
              proxyReq.setHeader('Authorization', `Basic ${auth}`)
            })
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
