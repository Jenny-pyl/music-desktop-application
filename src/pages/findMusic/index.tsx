import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTopSongList } from '@/music/fetch/netease'
import type { TopSongListRecord } from '@/music/fetch'
import { query2search } from '@/utils'
import Image from '@/components/image'
import { ROUTER_PATH } from '@/routes/router'
import styles from './index.module.scss'

const findMusic: FC = () => {
  const navigate = useNavigate()
  const [categoryList, setCategoryList] = useState<TopSongListRecord[]>([])

  const clickItem = (record: TopSongListRecord) => {
    navigate({
      pathname: ROUTER_PATH.play,
      search: query2search({ disstid: record.dissid }),
    })
  }

  useEffect(() => {
    getTopSongList().then(list => {
      setCategoryList(list)
    })
  }, [])

  return (
    <div className={[styles.findMusic, 'd-flex flex-column h-100'].join(' ')}>
      <div className='category-info p-2'>
        <h2 className='mb-0'>🔥 Netease 热榜</h2>
      </div>
      <div className='category-list p-2'>
        {categoryList.map(item => (
          <div
            key={item.dissid}
            className='category-list-item'
            onClick={() => clickItem(item)}
          >
            <div className='category-cover-img'>
              <Image src={item.cover_img_url} />
            </div>
            <div className='category-title'>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default findMusic
