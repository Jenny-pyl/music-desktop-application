import { BrowserWindow, ipcMain } from 'electron'
import { Sql } from './sql'
import { IPC } from '@common/constants'

export class Ipc {
  constructor(
    public win: BrowserWindow,
    public sql: Sql,
  ) {
    ipcMain.handle(IPC.获取音乐列表, () => {
      return [
        { name: 'foo', auth: 'foo' },
        { name: 'bar', auth: 'bar' },
      ]
    })
  }
}
