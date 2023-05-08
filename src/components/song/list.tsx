import {
  type TableProps,
  Table,
} from 'antd'
import {
  PictureOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons'
import {
  type SongRecord,
  fetchMusic_autoRetry,
  fetchMusic_isError,
} from '@/fetch-music/fetch'
import { lyric } from '@/fetch-music/qq'
import { Player } from '@/fetch-music/play'
import Image from '@/components/image'
import styles from './list.module.scss'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    ...omit
  } = props

  const clickPlay = async (song: SongRecord) => {
    const [
      lyricResult,
      musicResult,
    ] = await Promise.all([
      lyric(song.mid),
      fetchMusic_autoRetry({
        mid: song.mid,
        title: song.title,
        artist: song.artist,
      }),
    ])

    console.log('[歌词]', lyricResult)
    console.log('[音源]', musicResult)

    if (!fetchMusic_isError(musicResult)) {
      Player.getInstance({ src: musicResult.url }).play()
    }

  }

  const tableProps: TableProps<SongRecord> = {
    rowKey: 'mid',
    size: 'small',
    className: [className, styles['song-list-table']].filter(Boolean).join(' '),
    pagination: false,
    columns: [
      {
        title: <PlaySquareOutlined />,
        dataIndex: '-',
        className: 'song-play-cell',
        render: (_, record) => (
          <div
            className='song-play-icon'
            onClick={() => clickPlay(record)}
          >
            <PlayCircleOutlined />
          </div>
        ),
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
