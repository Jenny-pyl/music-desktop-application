import { FC, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { TopSongListRecord } from '@/music/fetch'
import { locaStorage, query2search } from '@/utils'
import { ROUTER_PATH } from '@/routes/router'
import { UserInfo } from '@/components/layouts'
import { Modal } from 'antd'
import { IPC } from '@common/constants'
import CDList from '@/components/cd/list'
import styles from './index.module.scss'

const myCollect: FC = () => {
  const userInfo = locaStorage.get<UserInfo | null>('userInfo')
  const navigate = useNavigate()
  const [CDData, setCDData] = useState<TopSongListRecord[]>([])
  const [modal, contextHolder] = Modal.useModal()

  const clickCD = (record: TopSongListRecord) => {
    navigate({
      pathname: ROUTER_PATH.play,
      search: query2search({
        disstid: record.dissid,
        from: 'myCollect',
        record: JSON.stringify(record),
      }),
    })
  }

  useEffect(() => {
    if (userInfo?.id) {
      window.ipcRenderer.invoke(IPC.获取我的收藏, { userId: userInfo?.id }).then(res => {
        if (res.code === 1) {
          setCDData(res.data)
        }
      })
    } else {
      modal.confirm({
        title: '您还未登录',
        content: '确定跳转至登录页面',
        onOk() {
          navigate('/login')
        },
      })
    }
  }, [])

  return (
    <div className={[styles.myCollect, 'd-flex flex-column h-100'].join(' ')}>
      <div className='cd-info p-2'>
        <h2 className='mb-0'>我的收藏</h2>
      </div>
      <div className='cd-list-wrap p-2'>
        <CDList
          CDList={CDData}
          clickCD={clickCD}
        />
      </div>
      {contextHolder}
    </div>
  )
}

export default myCollect
