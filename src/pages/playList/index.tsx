import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Skeleton } from 'antd'
import { search2query } from '@/utils'
import { getDisc } from '@/music/fetch/qq'
import type { DiscResult } from '@/music/fetch/qq/types/disc'
import SongList from '@/components/song/list'
import Image from '@/components/image'
import styles from './index.module.scss'

export default () => {
  const location = useLocation()
  const query = search2query(location.search) as { disstid: string }
  const [loading, setLoading] = useState(false)
  const [disc, setDisc] = useState<DiscResult>()

  useEffect(() => {
    setLoading(true)
    getDisc(query.disstid)
      .then(setDisc)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={[styles.playList, 'd-flex flex-column h-100'].join(' ')}>
      <div className='play-info d-flex p-2'>
        <div className='play-info-cover-img'>
          {disc?.info.cover_img_url
            ? <Image src={disc?.info.cover_img_url} />
            : <Skeleton.Image active style={{ width: 124, height: 124 }} />}
        </div>
        <div className='play-info-details p-2'>
          <h2>{disc?.info.title}</h2>
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