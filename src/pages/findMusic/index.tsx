import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryList } from '@/fetch-music/qq'
import type { CategoryRecord } from '@/fetch-music/qq/types/category'
import { query2search } from '@/utils'
import styles from './index.module.scss'

const findMusic: FC = () => {
  const navigate = useNavigate()
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([])

  const clickItem = (record: CategoryRecord) => {
    navigate(`/playList?${query2search({ disstid: record.dissid })}`)
  }

  useEffect(() => {
    getCategoryList().then(list => {
      setCategoryList(list)
    })
  }, [])

  return (
    <div className={[styles.findMusic, 'd-flex flex-column h-100'].join(' ')}>
      <div className='category-info p-2'>
        <h2 className='mb-0'>QQ 音乐热榜</h2>
      </div>
      <div className='category-list p-2'>
        {categoryList.map(item => (
          <div
            key={item.dissid}
            className='category-list-item'
            onClick={() => clickItem(item)}
          >
            <div className='category-cover-img'>
              <img src={item.cover_img_url} />
            </div>
            <div className='category-title'>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default findMusic