import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, message } from 'antd'
import { create } from 'zustand'
import type { SearchResult, SongRecord } from '@/music/fetch'
import SongList from '@/components/song/list'
import usePlay from '@/hooks/use-play'
import { query2search, search2query } from '@/utils'
import { ROUTER_PATH } from '@/routes/router'
import { searchMusic as searchNetease } from '@/music/fetch/netease'
import styles from './index.module.scss'

const { Search } = Input

interface SearchStore {
  keywords?: string
  setKeywords: (keywords: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  data?: SearchResult
  setData: (data: SearchResult) => void
}

const useSearchStore = create<SearchStore>()((set) => ({
  keywords: undefined,
  setKeywords: (keywords: string) => set({ keywords }),
  loading: false,
  setLoading: (loading: boolean) => set(() => ({ loading })),
  data: undefined,
  setData: (data: SearchResult) => set(() => ({ data })),
}))

export function SongSearch() {
  const location = useLocation()
  const isSearchPage = location.pathname === ROUTER_PATH.search
  const navigate = useNavigate()
  const {
    keywords = isSearchPage ? search2query(location.search).keywords : undefined,
    setKeywords,
    loading,
    setLoading,
    setData,
  } = useSearchStore()
  const { setSongList } = usePlay()

  const searchMusic = async (value: string) => {
    if (!value) {
      message.warning('请输入关键词搜索 ^_^')
      return
    }
    navigate({
      pathname: ROUTER_PATH.search,
      search: query2search({ keywords: value }),
    }, { replace: isSearchPage })
  }

  useEffect(() => {
    if (!keywords) return

    setLoading(true)
    searchNetease({ keywords })
      .then(data => {
        setSongList(data.list as SongRecord[])
        setData(data)
      })
      .finally(() => setLoading(false))
  }, [keywords])

  useEffect(() => {
    if (isSearchPage) {
      setKeywords(search2query(location.search).keywords)
    }
  }, [location.search])

  return (
    <Search
      placeholder='歌名、歌手'
      loading={loading}
      defaultValue={keywords}
      onSearch={searchMusic}
    />
  )
}

export default () => {
  const {
    keywords = '--',
    loading,
    data,
  } = useSearchStore()

  return (
    <div className={[styles.search, 'd-flex flex-column h-100'].join(' ')}>
      <div className='search-info p-2'>
        <h2 className='mb-0'>{keywords}</h2>
      </div>
      <div className='play-list p-2'>
        <SongList
          loading={loading}
          dataSource={data?.list as SongRecord[]}
        />
      </div>
    </div>
  )
}
