import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import {
  type SongRecord,
  fetchMusic_autoRetry,
  isResultError,
} from '@/music/fetch'
import { lyric as fetchLyric } from '@/music/fetch/netease'
import {
  type Player,
  type EventName,
  Play,
  EVENT,
} from '@/music/play'

const TAG = '[use-play]'

export interface PlayInfo {
  /** 进度百分比 */
  percent: number
  /** 当前播放秒数 */
  seek: number
  /** 总播放时长 */
  duration: number
}

interface SearchStore {
  playing?: SongRecord
  setPlaying: (song?: SongRecord) => void
  event?: EventName
  setEvent: (event: EventName) => void
  playInfo?: PlayInfo
  setPlayInfo: (playInfo: PlayInfo) => void
  timestamp?: number
  setTimestamp: (timestamp: number) => void
  /** 获取音源地址 */
  fetching?: SongRecord
  setFetching: (song?: SongRecord) => void
  /** player 拉取音源数据 */
  loading?: SongRecord
  setLoading: (song?: SongRecord) => void
  song?: SongRecord
  setSong: (song: SongRecord) => void
  lyric?: string
  setLyric: (lyric: string) => void
}

const useSearchStore = create<SearchStore>()((set) => ({
  playing: undefined,
  setPlaying: song => set({ playing: song }),
  event: undefined,
  setEvent: event => set({ event }),
  playInfo: undefined,
  setPlayInfo: playInfo => set({ playInfo }),
  timestamp: undefined,
  setTimestamp: timestamp => set({ timestamp }),
  fetching: undefined,
  setFetching: fetching => set(({ fetching })),
  loading: undefined,
  setLoading: loading => set(({ loading })),
  song: undefined,
  setSong: song => set(({ song })),
  lyric: undefined,
  setLyric: (lyric: string) => set({ lyric }),
}))

export default function usePlay() {
  const {
    playing,
    setPlaying,
    event,
    setEvent,
    playInfo,
    setPlayInfo,
    timestamp,
    setTimestamp,
    fetching,
    setFetching,
    loading,
    setLoading,
    song,
    setSong,
    lyric,
    setLyric,
  } = useSearchStore()
  const refPlayer = useRef<Player>()

  return {
    playing,
    event,
    playInfo,
    timestamp,
    fetching,
    loading,
    song,
    lyric,

    // ---- methods ----

    getPlayer() {
      return refPlayer.current
    },

    async play(song: SongRecord) {
      const cachePlayer = Play.players.find(p => p.mid === song.mid)
      let src: string | undefined
      let lyric = "[99:00.00]暂无歌词\n"

      if (cachePlayer) {
        // 优先使用缓存
        src = cachePlayer.src as string
        lyric = cachePlayer.lyric
      } else {
        setFetching(song)

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
        ]).finally(() => {
          setFetching()
        })

        if (!isResultError(musicResult)) {
          setLoading(song) // 不在缓存中的音源必定会触发 player 拉取音源(并不一定触发 event.load)
          src = musicResult.url
          lyric = lyricResult.lyric
        }
      }

      if (src) {
        const _player = refPlayer.current = Play.play({
          mid: song.mid,
          src,
          lyric,
          event(name) {
            setEvent(name)

            console.log(TAG, 'event', name)

            if (name === 'load') { // 音源加载完成
              setSong(song)
              setLyric(lyric)
            }

            if (EVENT.unLoading.includes(name)) {
              setLoading()
            }

            if (EVENT.unPlay.includes(name)) {
              setPlaying(undefined)
            } else if (EVENT.play.includes(name)) {
              setPlaying(song)
            }
          },
          interval({ timestamp }) {
            setTimestamp(timestamp)
            const seek = _player.player.seek()
            const duration = _player.player.duration()

            setPlayInfo({
              percent: seek / duration,
              seek,
              duration,
            })
          },
        })
      }
    },

    pause() {
      Play.pause()
    }
  }
}
