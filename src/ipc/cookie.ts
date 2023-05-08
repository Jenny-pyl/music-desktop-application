import { IPC } from '@common/constants'

function get(filter: Electron.CookiesGetFilter): Promise<Electron.Cookie[]> {
  return window.ipcRenderer.invoke(IPC.获取cookie, filter)
}

async function set(details: Electron.CookiesSetDetails) {
  await window.ipcRenderer.invoke(IPC.设置cookie, details)
}

export default {
  get,
  set,
}
