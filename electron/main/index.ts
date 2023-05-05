import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { release } from 'os'
import path from 'path'
import { initWebRequest } from './web-request'
import { Sql } from './sql'
import { Ipc } from './ipc'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = path.join(__dirname, '../..')
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST_ELECTRON, '../public')

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// ----------------------------------------------------------------------

let win: BrowserWindow | null = null
let sql: Sql
let ipc: Ipc

app
  // 一切就绪，启动 Electron 应用
  .whenReady()
  // 应用入口，且只会执行一次
  // 在这里写一些初始化逻辑
  .then(() => {
    createWindow()

    initWebRequest()
    sql = Sql.getInstance()
    ipc = new Ipc(
      win!,
      sql,
    )
  })

app.on('window-all-closed', () => {
  // 当所有的窗口被关闭了需要将 win=null 回收内存
  win = null
  // 非 Mac(darwin) 电脑关闭所有窗口后应用退出，Mac 电脑关闭所有窗口后应用还是会在任务栏存活
  // 这里的设计仅仅是符让应用合用户使用 Windows、Mac 的习惯而已
  if (process.platform !== 'darwin') app.quit()
})

// 鼠标点击任务栏的应用图标触发
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    // 如果有已经打开的窗口(只是最小化状态或失焦状态)，重新拉起打开过的窗口
    allWindows[0].focus()
  } else {
    // 没有任何打开过的窗口，创建一个新的窗口
    createWindow()
  }
})

async function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    title: 'Main window',
    icon: path.join(process.env.PUBLIC, 'favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      webSecurity: false,
    },
    titleBarStyle: 'hiddenInset',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    // 开发期间加载 http://localhost:port
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // 开发模式自动打开 Devtools
    win.webContents.openDevTools()
  } else {
    // 构建后加载文件真实路径
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  // 防止页面中的 <a/> 标签点击调出新窗口，对于桌面应用来说很别扭
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}
