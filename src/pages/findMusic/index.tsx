import { FC, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTopSongList } from '@/music/fetch/netease'
import type { TopSongListRecord } from '@/music/fetch'
import { locaStorage, query2search } from '@/utils'
import Image from '@/components/image'
import { ROUTER_PATH } from '@/routes/router'
import styles from './index.module.scss'
import { UserInfo } from '@/components/layouts'
import { Modal } from 'antd'
import { IPC } from '@common/constants'

const findMusic: FC = () => {
  const userInfo = locaStorage.get<UserInfo | null>('userInfo')
  const location = useLocation();
  const navigate = useNavigate()
  const [categoryList, setCategoryList] = useState<TopSongListRecord[]>([])
  const [modal, contextHolder] = Modal.useModal()

  const fromCollect = location.pathname === '/myCollect'

  const clickItem = (record: TopSongListRecord) => {
    navigate({
      pathname: ROUTER_PATH.play,
      search: query2search({
        disstid: record.dissid,
        from: fromCollect ? 'collect' : 'findMusic',
        record: JSON.stringify(record),
      }),
    })
  }

  useEffect(() => {
    if(fromCollect) {
      if (!userInfo?.id) {
        modal.confirm({
          title: '您还未登录',
          content: '确定跳转至登录页面',
          onOk() {
            navigate('/login')
          },
        })
        return;
      }
      window.ipcRenderer.invoke(IPC.获取我的喜欢音乐列表, { userId: userInfo?.id }).then(res => {
        if (res.code === 1) {
          setCategoryList(res.data)
        }
      })
    } else {
      getTopSongList().then(list => {
        console.log('list', list)
        setCategoryList(list)
      })
    }
  }, [])

  return (
    <div className={[styles.findMusic, 'd-flex flex-column h-100'].join(' ')}>
      <div className='category-info p-2'>
        <h2 className='mb-0'>{fromCollect ? '我的收藏' : '🔥 Netease 热榜'}</h2>
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
      {contextHolder}
    </div>
  )
}

export default findMusic
