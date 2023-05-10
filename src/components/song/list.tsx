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
import usePlay from '@/hooks/use-play'
import Image from '@/components/image'
import styles from './list.module.scss'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    loading,
    ...omit
  } = props
  const {
    playing,
    event,
    playInfo,
    timestamp,
    fetching,
    loading: loadSong,
    song,

    play,
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
    columns: [
      {
        title: <PlaySquareOutlined />,
        dataIndex: '-',
        className: 'song-play-cell',
        render(_, record) {
          const active = playing === record
          return (
            <div
              className={['song-play-icon', active && 'active'].filter(Boolean).join(' ')}
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

  return <Table {...tableProps} />
}
