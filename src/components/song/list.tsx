import {
  type TableProps,
  Table,
} from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import type { SongRecord } from '@/fetch-music/types/search'
import styles from './list.module.scss'

export default (props: TableProps<SongRecord>) => {
  const {
    className,
    pagination,
    ...omit
  } = props

  const tableProps: TableProps<SongRecord> = {
    rowKey: 'id',
    size: 'small',
    className: [className, styles['song-list-table']].filter(Boolean).join(' '),
    pagination: false,
    columns: [
      {
        title: <PictureOutlined />,
        dataIndex: 'img_url',
        render: text => (
          <div className='song-img'>
            <img src={text} />
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
