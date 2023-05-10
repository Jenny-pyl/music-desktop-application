import {
  BrowserWindow,
  ipcMain,
  session,
} from 'electron'
import moment from 'moment'
import { Sql } from './sql'
import { IPC } from '@common/constants'

export class Ipc {
  constructor(
    public win: BrowserWindow,
    public sql: Sql,
  ) {
    ipcMain.handle(IPC.登录, async (_, args) => {
      try {
        const { username, password } = args
        const isExist = (await sql.selectOne('user', `WHERE username = '${username}'`)).length !== 0
        const res = await sql.selectOne('user', `WHERE username = '${username}' AND password = '${password}'`)
        if (res) {
          return {
            code: 1,
            msg: '登录成功',
            data: res,
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

    ipcMain.handle(
      IPC.获取cookie,
      (_event, filter: Electron.CookiesGetFilter) => session.defaultSession.cookies.get(filter),
    )

    ipcMain.handle(
      IPC.设置cookie,
      async (_event, details: Electron.CookiesSetDetails) => {
        session.defaultSession.cookies.set(details)
      },
    )

    ipcMain.handle(IPC.创建歌单, async (_, args) => {
      try {
        const { listName, userId } = args
        const createTime = moment().format('yyyy-MM-DD hh:mm:ss');
        const updateTime = createTime;
        const isExist = await sql.selectOne('songList', `WHERE listName = '${listName}'`)
        if (isExist) {
          return {
            code: 0,
            msg: '歌单名称重复',
          }
        }else {
          const res = await sql.insert('songList', {listName, userId, createTime, updateTime})
          return {
            code: 1,
            msg: res,
          };
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
