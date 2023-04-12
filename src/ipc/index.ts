import { IPC } from '@common/constants'

window.ipcRenderer.invoke(IPC.获取音乐列表).then(list => {
  console.log('---- ipc 获取音乐列表 ----')
  console.log(list)
})