import type {
  FetchResultOk,
  LyricResult,
  SongRecord,
} from '@/music/fetch'

export interface DownloadOptions {
  song: SongRecord
  music: FetchResultOk
  lyric: LyricResult
}

export interface DownloadResult {
  error: Error | null
}

export interface DownloadMeta {
  song: SongRecord
  lyric: LyricResult
  music: FetchResultOk
  musicFile: string
  timestamp: number
}
