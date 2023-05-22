import { useState, CSSProperties } from 'react'
import {
  type TableProps,
  Table,
  Menu,
  MenuProps,
  message,
  notification,
} from 'antd'
import { MenuInfo } from 'rc-menu/lib/interface'
import {
  PictureOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import {
  type SongRecord,
  fetchMusic_autoRetry,
  isResultError,
} from '@/music/fetch'
import { lyric as fetchLyric } from '@/music/fetch/netease'
import usePlay from '@/hooks/use-play'
import { useSongList } from '@/hooks/use-songList'
import { locaStorage } from '@/utils'
import { IPC } from '@common/constants'
import Image from '@/components/image'
import type { UserInfo } from '@/components/layouts'
import type { DownloadResult } from '@/pages/download/types'
import styles from './list.module.scss'

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
  const [downloading, setDownloading] = useState(false);

  const clickPlay = async (song: SongRecord) => {
    if (playing === song) {
      pause()
    } else {
      play(song)
    }
  }

  const clickDownload = async (song: SongRecord) => {
    setDownloading(true)
    const [
      musicResult,
      lyricResult,
    ] = await Promise.all([
      fetchMusic_autoRetry({
        mid: song.mid,
        title: song.title,
        artist: song.artist,
        platform: 'netease',
      }),
      fetchLyric(song.mid),
    ])
    if (!isResultError(musicResult)) {
      const { error }: DownloadResult = await window.ipcRenderer.invoke(IPC.下载歌曲, {
        song,
        music: musicResult,
        lyric: lyricResult,
      })
      if (error) {
        notification.error({
          message: '下载失败 =。=',
          description: error.message,
        })
      } else {
        message.success('下载成功 ^_^')
      }
    }
    setDownloading(false)
  }

  const classfiyMusic = (info: MenuInfo) => {
    if (info.key === 'like') {
      window.ipcRenderer.invoke(IPC.添加音乐到我的喜欢, { userId: userInfo?.id, songInfo: selectedRow }).then(res => {
        if (res.code === 1) {
          message.success('添加成功')
        } else {
          message.error(res.msg)
        }
      })
    } else {
      window.ipcRenderer.invoke(IPC.添加音乐到我的歌单, { userId: userInfo?.id, listId: info.key, songInfo: selectedRow }).then(res => {
        if (res.code === 1) {
          message.success('添加成功')
        } else {
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
        onDoubleClick(e) {
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
        render: value => (
          <div className='song-portrait'>
            <Image src={value} />
          </div>
        ),
      },
      {
        title: '歌名',
        dataIndex: 'title',
        render: (value, record) => (
          <div className='song-operate'>
            <span
              className='song-download'
              onClick={() => downloading
                ? message.info(`[${record.title}] 下载中 ^_^`)
                : clickDownload(record)}
            >{downloading ? '下载中' : '下载'}</span>
            <span className='song-title'>{value}</span>
          </div>
        ),
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
