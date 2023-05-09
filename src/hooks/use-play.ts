import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { create } from 'zustand'
import {
  type SongRecord,
  fetchMusic_autoRetry,
  isResultError,
} from '@/music/fetch'
import { lyric } from '@/music/fetch/netease'
import {
  type PlayOptions,
  Play,
} from '@/music/play'

interface SearchStore {
  playing?: boolean
  setPlaying: (playing: boolean) => void
  loading?: boolean
  setLoading: (loading: boolean) => void
  song?: SongRecord
  setSong: (song: SongRecord) => void
}

const useSearchStore = create<SearchStore>()((set) => ({
  playing: undefined,
  setPlaying: playing => set({ playing }),
  loading: undefined,
  setLoading: loading => set(() => ({ loading })),
  song: undefined,
  setSong: song => set(() => ({ song })),
}))

export default function usePlay() {
  const {
    playing,
    loading,
    song,
  } = useSearchStore()
  const [player, setPlayer] = useState<Play>()

  useEffect(() => {
    Play.play
  }, [])

  return {
    playing,
    loading,
    async play(song: SongRecord) {
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
        lyric(song.mid),
      ])

      if (!isResultError(musicResult)) {
        Play.play({
          src: musicResult.url,
          lyric: lyricResult.lyric,
          event(name, player) {
            console.log('event', name)
          },
          interval({ timestamp, player }) {
            console.log(timestamp, player.player.seek(), player.player.duration())
          },
        })
      }
    },
  }
}
