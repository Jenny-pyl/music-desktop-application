import { useEffect, useState } from 'react'
import { IPC } from '@common/constants'
import type { DownloadMeta } from './types'
import style from './index.module.scss'

export default () => {
  const [downloads, setDownload] = useState<DownloadMeta[]>([])

  useEffect(() => {
    window.ipcRenderer.invoke(IPC.获取下载歌曲).then(data => {
      setDownload(data)
    })
  }, [])

  return (
    <div className={style.download}>
      download
      {downloads.map(item => (
        <div>
          <span>{item.song.title} / {item.song.artist}</span> |
          <span>文件位置：{item.musicFile}</span>
        </div>
      ))}
    </div>
  )
}
