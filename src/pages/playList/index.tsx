import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Skeleton, Button, message } from 'antd'
import { locaStorage, search2query } from '@/utils'
import { getDisc } from '@/music/fetch/netease'
import type { DiscResult } from '@/music/fetch'
import SongList from '@/components/song/list'
import usePlay from '@/hooks/use-play'
import Image from '@/components/image'
import styles from './index.module.scss'
import { FolderAddOutlined } from '@ant-design/icons'
import { IPC } from '@common/constants'
import { UserInfo } from '@/components/layouts'

export default () => {
  const location = useLocation()
  const userInfo = locaStorage.get<UserInfo | null>('userInfo')
  const query = search2query(location.search) as { disstid: string; from: string; record: string }
  const [loading, setLoading] = useState(false)
  const [disc, setDisc] = useState<DiscResult>()
  const { setSongList } = usePlay()

  const fromCollect = query.from === 'collect'

  const addCollect = () => {
    console.log('addCollect')
    window.ipcRenderer.invoke(IPC.添加歌单到我的收藏, { userId: userInfo?.id , listInfo: JSON.parse(query.record) }).then(res => {
      if(res.code === 1) {
        message.success('添加成功')
      }else {
        message.error(res.msg)
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    getDisc(query.disstid)
      .then(disc => {
        setSongList(disc.list)
        setDisc(disc)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={[styles.playList, 'd-flex flex-column h-100'].join(' ')}>
      <div className='play-info d-flex p-2'>
        <div className='play-info-cover-img'>
          {disc?.info.img_url
            ? <Image src={disc?.info.img_url} />
            : <Skeleton.Image active style={{ width: 124, height: 124 }} />}
        </div>
        <div className='play-info-details p-2'>
          <h2>{disc?.info.title}</h2>
          {!fromCollect
            ?<Button
              icon={<FolderAddOutlined/>}
              onClick={addCollect}
            >收藏</Button>
            : null}
        </div>
      </div>
      <div className='play-list p-2'>
        <SongList
          loading={loading}
          dataSource={disc?.list}
        />
      </div>
    </div>
  )
}