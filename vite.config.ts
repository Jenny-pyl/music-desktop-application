import { rmSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(() => {
  rmSync(path.join(__dirname, 'dist-electron'), { recursive: true, force: true })

  return {
    build: { minify: false },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        '@common': path.join(__dirname, 'common'),
      },
    },
    plugins: [
      react(),
      electron([
        {
          // Main process
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              minify: false,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(pkg.dependencies),
              },
            },
            resolve: {
              alias: { '@common': path.join(__dirname, 'common') },
            }
          },
        },
        {
          // Preload scripts
          entry: 'electron/preload/index.ts',
          vite: {
            build: {
              minify: false,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(pkg.dependencies),
              },
            },
            resolve: {
              alias: { '@common': path.join(__dirname, 'common') },
            }
          },
          onstart(args) {
            // 渲染进程更新重载页面即可，无需重启整个 Electron 应用
            args.reload()
          },
        },
      ]),
      renderer(),
    ],
  }
})
