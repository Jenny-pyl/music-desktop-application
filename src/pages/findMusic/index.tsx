import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTopSongList } from '@/music/fetch/netease'
import type { TopSongListRecord } from '@/music/fetch'
import { query2search } from '@/utils'
import { ROUTER_PATH } from '@/routes/router'
import CDList from '@/components/cd/list'
import styles from './index.module.scss'

const findMusic: FC = () => {
  const navigate = useNavigate()
  const [CDData, setCDData] = useState<TopSongListRecord[]>([])

  const clickCD = (record: TopSongListRecord) => {
    navigate({
      pathname: ROUTER_PATH.play,
      search: query2search({
        disstid: record.dissid,
        from: 'findMusic',
        record: JSON.stringify(record),
      }),
    })
  }

  useEffect(() => {
    getTopSongList().then(list => {
      setCDData(list)
    })
  }, [])

  return (
    <div className={[styles.findMusic, 'd-flex flex-column h-100'].join(' ')}>
      <div className='cd-info p-2'>
        <h2 className='mb-0'>🔥 Netease 热榜</h2>
      </div>
      <div className='cd-list-wrap p-2'>
        <CDList
          CDList={CDData}
          clickCD={clickCD}
        />
      </div>
    </div>
  )
}

export default findMusic
