import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import { IPC } from "@common/constants"
import SongList from '@/components/song/list'
import style from './index.module.scss'
import { UserInfo } from '@/components/layouts';
import { locaStorage } from '@/utils';
import { Modal } from 'antd';
import usePlay from '@/hooks/use-play'
import { SongRecord } from '@/music/fetch';

const myCreate: FC = () => {
  const { id: listId } = useParams()
  const [loading, setLoading] = useState(false)
  const userInfo = locaStorage.get<UserInfo | null>('userInfo')
  const [modal, contextHolder] = Modal.useModal()
  const navigate = useNavigate()
  const { setSongList, songList } = usePlay()
  const [title, setTitle] = useState<string>()

  useEffect(() => {
    setLoading(true)
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
    window.ipcRenderer.invoke(IPC.获取歌单音乐列表, { userId: userInfo?.id, listId }).then(res => {
      console.log('1111', res)
      if (res.code === 1) {
        setSongList(res.data.list)
        setTitle(res.data.title)
      }
    }).finally(() => setLoading(false))
  }, [listId])

  console.log('songList', songList)

  return <div className={style.myCreate}>
    <div className='search-info p-2'>
      <h2 className='mb-0'>{title}</h2>
    </div>
    <div className='play-list p-2'>
      <SongList
        loading={loading}
        dataSource={songList as SongRecord[]}
      />
    </div>
    {contextHolder}
  </div>
}

export default myCreate;