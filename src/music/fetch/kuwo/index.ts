import axios from 'axios';
import cookie from '@/ipc/cookie';
import {
  type SearchOptions,
  type SearchResult,
  type FetchOptions,
  type FetchResult,
  type SongRecord,
  type SongListRecord,
  SearchType,
  defaultFetchOptions,
} from '..';
import type { SearchResponse, SongRecordRaw } from './types/search';
import type { FetchResponse } from './types/fetch';

const TAG = '[kuwo]';

function convert2song(song: SongRecordRaw) {
  return <SongRecord>{
    mid: song.rid as any,
    title: song.name,
    artist: song.artist,
    artist_id: song.artistid as any,
    album: song.album,
    album_id: song.albumid,
    platform: 'kuwo',
    source_url: `https://www.kuwo.cn/play_detail/${song.rid}`,
    img_url: song.pic,
  };
}

function convert2songList(record: SongRecordRaw) {
  return <SongListRecord>{
    dissid: record.albumid,
    title: record.name,
    platform: 'kuwo',
    source_url: `https://www.kuwo.cn/playlist_detail/${record.rid}`,
    img_url: record.pic,
    author: record.artist,
  };
}

async function kw_get_token(forceUpdateCookie = false) {
  const domain = 'https://www.kuwo.cn';
  const name = 'kw_token';

  if (forceUpdateCookie) {
    // 通过给主域名发请求得到返回头信息中的 Set-Cookie
    await axios.get(domain);
  }

  let cookies = await cookie.get({ url: domain, name });
  if (!cookies.length) {
    if (!forceUpdateCookie) {
      // auto refresh token
      cookies = await kw_get_token(true);
    }
  }
  return cookies;
}

// ----------------------------------------------------------------------

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/kuwo.js#L246
 */
export async function searchMusic(options: SearchOptions): Promise<SearchResult> {
  const {
    keywords,
    page_num,
    page_size,
    search_type,
  } = defaultFetchOptions(options);
  const api = {
    [SearchType.单曲]: 'searchMusicBykeyWord',
    [SearchType.歌单]: 'searchPlayListBykeyWord',
  }[search_type];

  const url = `https://www.kuwo.cn/api/www/search/${api}?key=${keywords}&pn=${page_num}&rn=${page_size}`;

  let token = await kw_get_token();
  let response = await axios.get<SearchResponse>(url, { headers: { csrf: token[0]?.value ?? '' } });
  if (response.data.success === false && /* 代表有过期的 token */token.length) {
    // token expire, refetch token and start get url - auto retry
    token = await kw_get_token(true);
    response = await axios.get(url, { headers: { csrf: token[0]?.value ?? '' } });
  }

  if (response.data.success === false || response.data.data === undefined) {
    console.warn(TAG, 'searchMusic', response.data);

    return {
      type: search_type,
      list: [],
      page_num,
      page_size,
      total: 0,
    };
  }

  return {
    type: search_type,
    list: response.data.data.list.map(item => search_type === SearchType.单曲
      ? convert2song(item)
      : convert2songList(item) as any,
    ),
    page_num,
    page_size,
    total: response.data.data.total as any,
  };
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/kuwo.js#L304
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  const url = `http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${options.mid}&type=convert_url3&br=128kmp3`;

  const response = await axios.get<FetchResponse>(url);
  const { data } = response;

  if (data && data.data && data.data.url) {
    return {
      platform: 'kuwo',
      url: data.data.url,
    };
  }

  console.warn(TAG, 'fetchMusic', response.data);

  return {
    platform: 'kuwo',
    error: '[酷我] known error',
  };
}
