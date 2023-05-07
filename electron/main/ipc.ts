import {
  BrowserWindow,
  ipcMain,
  session,
} from 'electron'
import type { IncomingMessage } from 'http'
import htpps from 'https'
import cookie from 'cookie'
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

    // TODO: 使用 Web 天然支持的 set cookie
    ipcMain.handle(
      IPC.设置酷我cookie,
      async (_event, details: Electron.CookiesSetDetails) => {
        const headers = await new Promise<IncomingMessage['headers']>(resolve => {
          const client = htpps.get(details.url, (res) => {
            client.destroy()
            resolve(res.headers)
          })
        })
        const cookieStr = headers['set-cookie']?.[0]
        if (cookieStr) {
          const cookieObj = cookie.parse(cookieStr) as {
            kw_token: string // '1KHVRTIT93I'
            path: string // '/'
            expires: string // 'Tue, 06 Jun 2023 14:24:06 GMT'
          }

          details.value = cookieObj.kw_token
          details.path = cookieObj.path
          details.expirationDate = new Date(cookieObj.expires).getTime()
        }
        session.defaultSession.cookies.set(details)
      },
    )
  }
}
