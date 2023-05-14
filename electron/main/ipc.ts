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
        } else {
          const res = await sql.insert('songList', { listName, userId, createTime, updateTime })
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

    ipcMain.handle(IPC.获取全部歌单, async (_, args) => {
      try {
        const { userId } = args
        const res = await sql.selectAll('songList', `WHERE userId = ${userId}`)
        return {
          code: 1,
          msg: '成功',
          data: res,
        };
      } catch (e) {
        return {
          code: 0,
          msg: e,
        }
      }
    })

    ipcMain.handle(IPC.添加音乐到我的喜欢, async (_, args) => {
      try {
        const { userId, songInfo } = args
        const isExist = await sql.selectOne('likeSong', `WHERE mid = ${songInfo.mid} AND userId = ${userId}`)
        if (isExist) {
          return {
            code: 0,
            msg: '该歌曲已在喜欢列表',
          }
        } else {
          const res = await sql.insert('likeSong', { userId, ...songInfo })
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

    ipcMain.handle(IPC.获取我的喜欢音乐列表, async (_, args) => {
      try {
        const { userId } = args
        const res = await sql.selectAll('likeSong', `WHERE userId = ${userId}`)
        return {
          code: 1,
          msg: '成功',
          data: res,
        };
      } catch (e) {
        return {
          code: 0,
          msg: e,
        }
      }
    })

    ipcMain.handle(IPC.添加音乐到我的歌单, async (_, args) => {
      try {
        const { userId, listId, songInfo } = args
        const isExist = await sql.selectOne('songInList', `WHERE mid = ${songInfo.mid} AND userId = ${userId} AND listId = ${listId}`)
        if (isExist) {
          const listObj = await sql.selectOne('songList', `WHERE userId = ${userId} AND id=${listId}`)
          return {
            code: 0,
            msg: `该歌曲已在${listObj.listName}列表`,
          }
        } else {
          const res = await sql.insert('songInList', { userId, listId, ...songInfo })
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

    ipcMain.handle(IPC.获取歌单音乐列表, async (_, args) => {
      try {
        const { userId, listId } = args
        const res = await sql.selectAll('songInList', `WHERE userId = ${userId} AND listId = ${listId}`)
        const listObj = await sql.selectOne('songList', `WHERE userId = ${userId} AND listId=${listId}`)
        return {
          code: 1,
          msg: '成功',
          data: {title: listObj.listName,list: res},
        };
      } catch (e) {
        return {
          code: 0,
          msg: e,
        }
      }
    })
  }
}
