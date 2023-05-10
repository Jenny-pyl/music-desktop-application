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

  objKey(obj: Record<any, any>) {
    return JSON.stringify(Object.keys(obj)).replace(/[\[\]]/g, '')
  }

  objVaule(obj: Record<any, any>) {
    return JSON.stringify(Object.values(obj)).replace(/[\[\]]/g, '')
  }

  // DML
  insert(tabelname: string, values: Record<string, any>): Promise<any> {
    console.log('dml', this.objKey(values), this.objVaule(values))
    return new Promise((resolve, reject) => {
      this.database.run(`INSERT INTO ${tabelname} (${this.objKey(values)}) VALUES(${this.objVaule(values)})`, function(err) {
        console.log('err', err)
        if (err) {
          reject(`insert error: ${err}`)
        }else {
          resolve('新增成功')
        }
      })
    })
  }

  update(tabelname: string, statement: string) {
    this.database.run(`UPDATE ${tabelname} ${statement}`, function (err) {
      if (err) {
        return console.log('update data error: ', err.message)
      }
      console.log('update data: ', this)
    })
  }

  delete(tabelname: string, statement: string) {
    this.database.run(`DELETE FROM ${tabelname} ${statement}`, function (err) {
      if (err) {
        return console.log(err.message)
      }
      console.log('deleted', this)
    })
  }

  // DQL
  select(tabelname: string, statement: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.database.all(`SELECT * FROM ${tabelname} ${statement}`, [], function (err, rows) {
        if (err) {
          reject(`find error: ${err}`)
        }
        console.log('select', rows)
        resolve(rows);
      })
    })
  }
}
