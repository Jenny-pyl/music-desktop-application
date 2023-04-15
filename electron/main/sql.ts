import { app } from 'electron'
import path from 'node:path'
import {
  type Database,
  verbose,
} from 'sqlite3'

const TAG = '[sqlite3]'

/**
 * Sql 类设计为单例模式
 */
export class Sql {
  private static instance: Sql

  public static getInstance(
    filename = path.join(app.getPath('userData'), 'pyl-music.sqlite3'),
  ) {
    return this.instance ??= new Sql(filename)
  }

  public database: Database

  private constructor(filename: string) {
    this.database = new (verbose().Database)(filename, error => {
      if (error) {
        console.log(TAG, '初始化失败')
        console.log(error)
      } else {
        console.log(TAG, '初始化成功')
      }
    })
  }

  create() {

  }

  read() {

  }

  update() {

  }

  delete() {

  }
}
