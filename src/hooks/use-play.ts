import { useMemo } from 'react'
import { create } from 'zustand'
import {
  type SongRecord,
  fetchMusic_autoRetry,
  isResultError,
} from '@/music/fetch'
import { lyric as fetchLyric } from '@/music/fetch/netease'
import {
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
  /** 时间戳 */
  timestamp: number
}

interface SearchStore {
  playing?: SongRecord
  setPlaying: (song?: SongRecord) => void
  event?: EventName
  setEvent: (event: EventName) => void
  playInfo?: PlayInfo
  setPlayInfo: (playInfo: PlayInfo) => void
  /** 获取音源地址 - axios */
  fetching?: SongRecord
  setFetching: (song?: SongRecord) => void
  /** 加载音源数据 - player */
  loading?: SongRecord
  setLoading: (song?: SongRecord) => void
  song?: SongRecord
  setSong: (song: SongRecord) => void
  songList?: SongRecord[]
  setSongList: (songList: SongRecord[]) => void
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
  fetching: undefined,
  setFetching: fetching => set(({ fetching })),
  loading: undefined,
  setLoading: loading => set(({ loading })),
  song: undefined,
  setSong: song => set(({ song })),
  songList: undefined,
  setSongList: songList => set(({ songList })),
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
    fetching,
    setFetching,
    loading,
    setLoading,
    song: storeSong,
    setSong,
    songList,
    setSongList,
    lyric,
    setLyric,
  } = useSearchStore()
  const lyricLines = useMemo(() => lyric ? parseLyric(lyric) : [], [lyric])
  const lyricActiveLine = useMemo(() => {
    let closest = lyricLines[0]
    const seek = playInfo?.seek ?? 0
    for (const line of lyricLines) {
      if (Math.abs(line.time - seek) < Math.abs(closest.time - seek)) {
        closest = line
      }
    }
    return closest
  }, [lyricLines, playInfo?.seek]) as typeof lyricLines[number] | undefined

  async function play(song: SongRecord) {
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
        // 不在缓存中的音源必定会触发 player 加载音源 load 事件，否则不会触发 load 事件
        setLoading(song)

        src = musicResult.url
        lyric = lyricResult.lyric
      }
    }

    if (src) {
      setSong(song)
      setLyric(lyric)

      Play.play({
        mid: song.mid,
        src,
        lyric,
        event(name) {
          console.log(TAG, 'event', name)

          setEvent(name)

          if (EVENT.unLoading.includes(name)) {
            setLoading()
          }

          if (EVENT.unPlay.includes(name)) {
            setPlaying(undefined)
          } else if (EVENT.play.includes(name)) {
            setPlaying(song)
          }
        },
        interval({ timestamp, player }) {
          const seek = player.player.seek()
          const duration = player.player.duration()

          setPlayInfo({
            percent: seek / duration,
            seek,
            duration,
            timestamp,
          })
        },
      })
    }
  }

  return {
    playing,
    event,
    playInfo,
    fetching,
    loading,
    song: storeSong,
    songList,
    setSongList,
    lyricLines,
    lyricActiveLine,

    // ---- methods ----

    getPlayer() {
      return Play.getActivePlayer()
    },
    play,
    pause() {
      Play.pause()
    },
    prev() {
      if (songList && songList.length > 1) {
        const firstSong = songList[0]
        const lastSong = songList[songList.length - 1]
        if (storeSong === firstSong) { // 列表顶部 - 第一首歌
          play(lastSong)
        } else {
          const index = songList.findIndex(s => s.mid === storeSong?.mid)
          if (index > -1) {
            play(songList[index - 1])
          }
        }
      }
    },
    next() {
      if (songList && songList.length > 1) {
        const firstSong = songList[0]
        const lastSong = songList[songList.length - 1]
        if (storeSong === lastSong) { // 列表底部 - 最后一首歌
          play(firstSong)
        } else {
          const index = songList.findIndex(s => s.mid === storeSong?.mid)
          if (index > -1) {
            play(songList[index + 1])
          }
        }
      }
    },
  }
}

// ------------------------------------------------------------------------------

// https://dev.to/mcanam/javascript-lyric-synchronizer-4i15
// lrc (String) - lrc file text
function parseLyric(lrc: string) {
  // will match "[00:00.00] ooooh yeah!" or "[00:00.0000] ooooh yeah!"
  // note: i use named capturing group
  const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2,4})?)\](?<text>.*)/;

  // split lrc string to individual lines
  const lines = lrc.split("\n");

  const output: { time: number, text: string }[] = [];

  for (const line of lines) {
    const match = line.match(regex);

    // if doesn't match, skip.
    if (match == null) continue;

    const { time, text } = match.groups!;

    output.push({
      time: parseTime(time),
      text: text.trim()
    });
  }

  return output;
}

// parse formated time
// "03:24.73" => 204.73 (total time in seconds)
function parseTime(time: string) {
  const minsec = time.split(":");

  const min = parseInt(minsec[0]) * 60;
  const sec = parseFloat(minsec[1]);

  return min + sec;
}
