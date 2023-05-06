import {
  TableProps,
  Table,
} from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import { useSearch } from '@/store/search'
import type { SongRecord } from '@/fetch-music/types/search'
import styles from './index.module.scss'

export default () => {
  const {
    data,
    loading,
  } = useSearch()

  const tableProps: TableProps<SongRecord> = {
    dataSource: data?.list as SongRecord[],
    className: 'search-table',
    rowKey: 'id',
    size: 'small',
    loading,
    pagination: false && {
      total: data?.total,
      pageSize: data?.page_size,
      current: data?.page_num,
      showSizeChanger: false,
      position: ['bottomCenter'],
    },
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
  }

  return (
    <div className={styles.search}>
      <Table {...tableProps} />
    </div>
  )
}
