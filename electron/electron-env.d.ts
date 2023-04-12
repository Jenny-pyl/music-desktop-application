/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    DIST_ELECTRON: string
    DIST: string
    /** /dist/ or /public/ */
    PUBLIC: string
  }
}

interface Window {
  // 渲染进程使用 `window.ipcRenderer` 时代码提示
  ipcRenderer: import('electron').IpcRenderer
}
