import { useState,CSSProperties } from 'react'
import {
  type TableProps,
  Table,
  Menu,
  MenuProps,
  message,
} from 'antd'
import {
  PictureOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { UserInfo } from '@/components/layouts'
import type { SongRecord } from '@/music/fetch'
import usePlay from '@/hooks/use-play'
import Image from '@/components/image'
import { useSongList } from '@/hooks/use-songList'
import { locaStorage } from '@/utils'
import { IPC } from "@common/constants"
import styles from './list.module.scss'
import { MenuInfo } from 'rc-menu/lib/interface'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    loading,
    onRow,
    ...omit
  } = props
  const {
    playing,
    fetching,
    loading: loadSong,
    play,
    song,
    pause,
  } = usePlay()
  const userInfo = locaStorage.get<UserInfo | null>('userInfo')
  const [songList] = useSongList(userInfo?.id)
  const [isMenuVisiable, setIsMenuVisiable] = useState<boolean>(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [selectedRow, setSelectedRow] = useState<SongRecord>();

  const clickPlay = async (song: SongRecord) => {
    if (playing === song) {
      pause()
    } else {
      play(song)
    }
  }

  console.log('omit', omit)

  const classfiyMusic = (info: MenuInfo) => {
    if(info.key === 'like') {
      window.ipcRenderer.invoke(IPC.添加音乐到我的喜欢, { userId: userInfo?.id, songInfo: selectedRow }).then(res => {
        if(res.code === 1) {
          message.success('添加成功')
        }else {
          message.error(res.msg)
        }
      })
    }else {
      window.ipcRenderer.invoke(IPC.添加音乐到我的歌单, { userId: userInfo?.id, listId: info.key, songInfo: selectedRow }).then(res => {
        if(res.code === 1) {
          message.success('添加成功')
        }else {
          message.error(res.msg)
        }
      })
    }
  }

  const menuItem: MenuProps['items'] = [
    {
      label: '添加至我的喜欢',
      key: 'like',
    },
    ...(songList?.map((item) => ({
      label: `添加至${item.listName}`,
      key: item.listId
    })) ?? [])
  ]

  const tableProps: TableProps<SongRecord> = {
    rowKey: 'mid',
    size: 'small',
    className: [className, styles['song-list-table']].filter(Boolean).join(' '),
    pagination: false,
    loading: loading || !!fetching,
    onRow(record, index) {
      const attrs = onRow?.(record, index)
      const active = (song === record || selectedRow === record)
      return {
        ...attrs,
        className: [active && 'active-playing', attrs?.className].filter(Boolean).join(' '),
        onDoubleClick(e){
          e.preventDefault()
          setIsMenuVisiable(true);
          setMenuStyle({
            top: e.clientY - 10 + 'px',
            left: e.clientX + 'px',
            position: 'absolute',
          })
          setSelectedRow(record);
        },
        onClick() {
          console.log(record, 'record')
          setIsMenuVisiable(false)
          setSelectedRow(undefined)
        }
      }
    },
    columns: [
      {
        title: <PlaySquareOutlined />,
        dataIndex: '-',
        className: 'song-play-cell',
        render(_, record) {
          const active = playing === record
          return (
            <div
              className='song-play-icon'
              onClick={() => clickPlay(record)}
            >
              {loadSong === record
                ? <LoadingOutlined />
                : active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            </div>
          )
        },
      },
      {
        title: <PictureOutlined />,
        dataIndex: 'img_url',
        render: text => (
          <div className='song-portrait'>
            <Image src={text} />
          </div>
        ),
      },
      {
        title: '歌名',
        dataIndex: 'title',
      },
      {
        title: '歌手',
        dataIndex: 'artist',
      },
      {
        title: '专辑',
        dataIndex: 'album',
      },
    ],
    ...omit,
  }

  return (<div>
    <Table {...tableProps} />
    {isMenuVisiable ? <Menu
      className='clickMenu'
      items={menuItem}
      style={menuStyle}
      onClick={(info) => classfiyMusic(info)}
    /> : null}
  </div>)
}
