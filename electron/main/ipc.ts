import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import {
  app,
  BrowserWindow,
  ipcMain,
  session,
} from 'electron'
import moment from 'moment'
import { Sql } from './sql'
import { IPC } from '@common/constants'
import type {
  DownloadOptions,
  DownloadMeta,
  DownloadResult,
} from '@/pages/download/types'

const downloadPath = path.join(app.getPath('userData'), 'downloads')

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
          data: { title: listObj.listName, list: res },
        };
      } catch (e) {
        return {
          code: 0,
          msg: e,
        }
      }
    })

    ipcMain.handle(IPC.添加歌单到我的收藏, async (_, args) => {
      try {
        const { userId, listInfo } = args
        const isExist = await sql.selectOne('collectList', `WHERE dissid = '${listInfo.dissid}' AND userId = ${userId}`)
        if (isExist) {
          return {
            code: 0,
            msg: `该歌单已收藏`,
          }
        } else {
          const res = await sql.insert('collectList', { userId, ...listInfo })
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

    ipcMain.handle(IPC.获取我的收藏, async (_, args) => {
      try {
        const { userId } = args
        const res = await sql.selectAll('collectList', `WHERE userId = ${userId}`)
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

    ipcMain.handle(IPC.下载歌曲, (_, args) => new Promise<DownloadResult>(async resolve => {
      const {
        song,
        music,
        lyric,
      } = args as DownloadOptions
      const targetPath = path.join(downloadPath, song.mid.toString())
      !fs.existsSync(targetPath) && fs.mkdirSync(targetPath, { recursive: true })
      const metaFile = path.join(targetPath, 'meta.json')
      const musicFile = path.join(targetPath, `${song.title}.mp3`)
      const request = (music.url.startsWith('https') ? https : http).get(music.url, res => {
        res
          .pipe(fs.createWriteStream(musicFile))
          .on('error', error => {
            resolve({ error })
          })
          .on('finish', () => {
            const meta: DownloadMeta = {
              song,
              lyric,
              music,
              musicFile,
              timestamp: Date.now(),
            }
            fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2))
            resolve({ error: null })
          })
          .on('close', () => {
            request.destroy()
          })
      })
    }))

    ipcMain.handle(IPC.获取下载歌曲, () => {
      const dirs = fs.readdirSync(downloadPath)
      const metas: DownloadMeta[] = []
      for (const dir of dirs) {
        try {
          const metaJson = path.join(downloadPath, dir, 'meta.json')
          if (fs.existsSync(metaJson)) {
            const jsonStr = fs.readFileSync(metaJson, 'utf8')
            if (jsonStr) {
              metas.push(JSON.parse(jsonStr))
            }
          }
        } catch { }
      }

      return metas
    })
  }
}
