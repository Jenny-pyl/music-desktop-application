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
  isResultError,
} from '@/music/fetch'
import { lyric } from '@/music/fetch/netease'
import { Play } from '@/music/play'
import usePlay from '@/hooks/use-play'
import Image from '@/components/image'
import styles from './list.module.scss'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    ...omit
  } = props
  const {
    play,
  } = usePlay()

  const clickPlay = async (song: SongRecord) => {
    play(song)
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
