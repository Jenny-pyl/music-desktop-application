import { FC, useEffect, useState } from 'react'
import { getCategoryList } from '@/fetch-music/qq'
import type { CategoryRecord } from '@/fetch-music/types'
import style from './index.module.scss'

const findMusic: FC = () => {
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([])

  useEffect(() => {
    getCategoryList().then(list => {
      setCategoryList(list)
    })
  }, [])

  return (
    <div className={style.findMusic}>
      <div className='category-list d-flex flex-wrap justify-content-between'>
        {categoryList.map(item => (
          <div key={item.id} className='category-list-item'>
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