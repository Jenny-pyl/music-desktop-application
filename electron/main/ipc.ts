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
    ipcMain.handle(IPC.登录, async (_, args) => {
      try {
        const { username, password } = args
        const isExist = (await sql.select('user', `WHERE username = '${username}'`)).length !== 0
        const res = await sql.select('user', `WHERE username = '${username}' AND password = '${password}'`)
        if (res && res.length) {
          return {
            code: 1,
            msg: '登录成功',
            data: res[0],
          };
        } else {
          return {
            code: 0,
            msg: isExist ? '密码错误' : '用户不存在',
          }
        }
      } catch (e) {
        return {
          code: 0,
          msg: e,
        }
      }
    })
  }
}
