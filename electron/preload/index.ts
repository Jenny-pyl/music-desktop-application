import { ipcRenderer } from 'electron'
import { useLoading } from './loading'
import { domReady } from './utils'

// ---- 预加载动画 ---- -s-
const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = ev => ev.data.payload === 'removeLoading' && removeLoading()
setTimeout(removeLoading, 4999)
// ---- 预加载动画 ---- -e-

// 向渲染进程抛出 ipcRenderer
window.ipcRenderer = ipcRenderer

