import {
  type TableProps,
  Table,
} from 'antd'
import {
  PictureOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import type { SongRecord } from '@/music/fetch'
import { useGlobalColor } from '@/store'
import usePlay from '@/hooks/use-play'
import Image from '@/components/image'
import styles from './list.module.scss'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    loading,
    onRow,
    ...omit
  } = props
  const { color } = useGlobalColor()
  const {
    playing,
    fetching,
    loading: loadSong,
    play,
    song,
    pause,
  } = usePlay()

  const clickPlay = async (song: SongRecord) => {
    if (playing === song) {
      pause()
    } else {
      play(song)
    }
  }

  const tableProps: TableProps<SongRecord> = {
    rowKey: 'mid',
    size: 'small',
    className: [className, styles['song-list-table']].filter(Boolean).join(' '),
    pagination: false,
    loading: loading || !!fetching,
    onRow(record, index) {
      const attrs = onRow?.(record, index)
      const active = song === record
      return {
        ...attrs,
        className: [active && 'active-playing', attrs?.className].filter(Boolean).join(' '),
        style: {
          backgroundColor: active ? color + /* 十六进制透明 */'22' : undefined,
          color: active ? color : undefined,
          ...attrs?.style,
        },
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
              style={{ color: active ? color : undefined }}
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

  return <Table {...tableProps} />
}
