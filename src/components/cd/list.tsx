import { FC } from 'react'
import type { TopSongListRecord } from '@/music/fetch'
import Image from '@/components/image'
import styles from './list.module.scss'

const CDList: FC<{
  CDList: TopSongListRecord[]
  clickCD: (CD: TopSongListRecord) => void
}> = props => {
  const { CDList, clickCD } = props

  return (
    <div className={[styles['cd-list']].join(' ')}>
      {CDList.map(item => (
        <div
          key={item.dissid}
          className='cd-list-item'
          onClick={() => clickCD(item)}
        >
          <div className='cd-cover-img'>
            <Image src={item.cover_img_url} />
          </div>
          <div className='cd-title'>{item.title}</div>
        </div>
      ))}
    </div>
  )
}

export default CDList
