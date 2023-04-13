import { app } from 'electron'
import path from 'node:path'
import {
  type Database,
  verbose,
} from 'sqlite3'

const TAG = '[sqlite3]'

export class Sql {
  public database: Database

  constructor(
    filename = path.join(app.getPath('userData'), 'pyl-music.sqlite3'),
  ) {
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
