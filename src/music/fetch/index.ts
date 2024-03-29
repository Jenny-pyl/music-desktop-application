import { message } from 'antd'
import {
  searchMusic as searchNetease,
  fetchMusic as fetchNetease,
} from './netease'
import {
  searchMusic as searchKuwo,
  fetchMusic as fetchKuwo,
} from './kuwo'
import {
  searchMusic as searchQQ,
  fetchMusic as fetchQQ,
} from './qq'

export type MusicPlatform =
  | 'netease'
  | 'qq'
  | 'kuwo'
  | 'migu'

export type MusicQuality =
  | 'HQ'
  | 'SQ'
  | 'ZQ'
  | 'PQ'

export enum SearchType {
  单曲 = 0,
  歌单 = 3,
}

export enum MusicBitrate {
  HQ = '320kbps',
  SQ = '999kbps',
  ZQ = '999kbps',
  PQ = '128kbps',
}

export interface TopSongOptions {
  /** 热榜 ID */
  filterId?: string | number
  offset?: number
  /** @defaultValue 24 */
  size?: number
}

export interface TopSongListRecord {
  // qq 音乐的接口也是一坨 💩 有接口用 dissid 有接口用 disstid 不清楚是什么意思
  dissid: string | number
  cover_img_url: string
  source_url: string
  title: string
}

export interface LyricResult {
  /** 歌词 */
  lyric: string
  /** 歌词-翻译 */
  tlyric: string
}

export interface SearchOptions {
  keywords: string
  page_num?: number
  page_size?: number
  search_type?: SearchType
}

/** 单曲 */
export interface SongRecord {
  /** Music id */
  mid: string | number
  /** 歌曲 */
  title: string
  /** 歌手 */
  artist: string
  artist_id: string | number
  /** 专辑 */
  album: string
  album_id: string | number
  img_url: string
  platform: MusicPlatform
  source_url: string

  url?: string
  lyric_url?: string
  tlyric_url?: string
  quality?: string
  song_id?: string
}

/** 歌单 */
export interface SongListRecord {
  /** 这里统一叫 discId，即唱片 ID */
  discId: string | number
  title: string
  platform: MusicPlatform
  source_url: string
  img_url: string

  author?: string
  count?: number
}

export interface SearchResultSong {
  type: SearchType.单曲
  list: SongRecord[]
  page_num: number
  page_size: number
  total: number
}
export interface SearchResultSongList {
  type: SearchType.歌单
  list: SongListRecord[]
  page_num: number
  page_size: number
  total: number
}
export type SearchResult = SearchResultSong | SearchResultSongList

/** 唱片结果 */
export interface DiscResult {
  list: SongRecord[]
  info: SongListRecord
}

export interface FetchOptions {
  /** Music id */
  mid: string | number
  /** 多平台重试字段 - 当前音源平台 ['netease', 'qq'] */
  platform?: MusicPlatform
  /** 多平台重试字段 - 歌曲 */
  title?: string
  /** 多平台重试字段 - 歌手 */
  artist?: string
  /**
   * 多平台重试字段 - 模糊匹配，免费歌曲很多非原唱
   * @defaultValue true
   */
  loose?: boolean
  quality?: MusicQuality
}

export interface FetchResultOk {
  platform: MusicPlatform
  url: string
  bitrate?: string
}
export type FetchResult = FetchResultOk | ResultError

// ------------------------

export interface ResultError {
  platform: MusicPlatform
  error: string
}
export function isResultError(x: any): x is ResultError {
  return x.error
}

// ----------------------------------------------------------------------

const TAG = '[fetch]'

async function fetchAutoRetry(
  options: FetchOptions,
  plfms = [
    { search: searchKuwo, fetch: fetchKuwo },
    { search: searchQQ, fetch: fetchQQ }, // QQ 大都需要 VIP，放到最后
  ],
) {
  // 多平台搜索依靠这两个条件
  const title = getHtmlTextContent(options.title)
  const artist = getHtmlTextContent(options.artist)
  if (!(title && artist)) return

  // https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L366
  for (const plfm of plfms) {
    // TODO: better query method
    const searchResult = await plfm.search({ keywords: [options.title, options.artist].join(' ') })
    // compare search track and track to check if they are same
    // TODO: better similar compare method (duration, md5)
    let song = (searchResult.list as SongRecord[]).find(item => (
      // 精准匹配
      item.title === title && item.artist === artist
    ))
    if (!song && options.loose !== false) {
      song = (searchResult.list as SongRecord[]).find(item => (
        // 模糊匹配
        item.title.includes(title) && item.artist.includes(artist)
      ))
    }
    if (song) {
      const fetchResult = await plfm.fetch({ mid: song.mid })
      if (!isResultError(fetchResult)) {
        return fetchResult
      }
    }
  }
}

// ------------------------

export function defaultFetchOptions(options: SearchOptions) {
  options.page_num ??= 1
  options.page_size ??= 24
  options.search_type ??= SearchType.单曲
  return options as Required<SearchOptions>
}

export function getHtmlTextContent(html = '') {
  const parser = new DOMParser()
  return parser.parseFromString(html, 'text/html').body.textContent
}

export function UnicodeToAscii(str: string) {
  return str.replace(/&#(\d+);/g, () =>
    String.fromCharCode(arguments[1])
  )
}

export function uuid() {
  // https://abhishekdutta.org/blog/standalone_uuid_generator_in_javascript.htm
  const temp_url = URL.createObjectURL(new Blob())
  const strTemp = temp_url.toString()
  URL.revokeObjectURL(temp_url)
  return strTemp.slice(strTemp.lastIndexOf('/') + 1) // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
}

export function getParameterByName(name: string, url: string) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * 源码链路
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/listen1.html#L1675
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/controller/navigation.js#L366
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/l1_player.js#L38
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/bridge.js#L38
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/bridge.js#L13
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/player_thread.js#L620-L622
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/player_thread.js#L198
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/player_thread.js#L209
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/player_thread.js#L220
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L338
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L402 - 核心逻辑
 * 
 * 多平台同时拉取音源，失败后自动重试其他平台酱紫 ⊙∀⊙！
 */
export async function fetchMusic_autoRetry(options: FetchOptions): Promise<FetchResult> {
  const cache = fetchMusic_autoRetry.cache.get(options.mid)
  if (cache) {
    return cache
  }

  // https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L338-L403 - 多平台切换逻辑
  let fetchResult = await (options.platform === 'qq' ? fetchQQ(options) : fetchNetease(options))
  if (isResultError(fetchResult)) {
    const fetchResultOk = await fetchAutoRetry(options)
    if (fetchResultOk) {
      fetchResult = fetchResultOk
    }
  }

  if (isResultError(fetchResult)) {
    // 多平台拉取均失败
    message.warning('VIP 音乐需要会员才可以播放哦 ^_^')
  } else {
    fetchMusic_autoRetry.cache.set(options.mid, fetchResult)
  }

  return fetchResult
}
fetchMusic_autoRetry.cache = new Map<FetchOptions['mid'], FetchResultOk>()
