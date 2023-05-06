import type { SearchResult } from '@/fetch-music/types/search';
import { create } from 'zustand'

type SearchStore = {
  keywords?: string
  setKeywords: (keywords: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  data?: SearchResult
  setData: (data: SearchResult) => void
}

export const useSearch = create<SearchStore>()((set) => ({
  keywords: undefined,
  setKeywords: (keywords: string) => set({ keywords }),
  loading: false,
  setLoading: (loading: boolean) => set(() => ({ loading })),
  data: undefined,
  setData: (data: SearchResult) => set(() => ({ data })),
}))
