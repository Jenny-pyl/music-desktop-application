import axios from 'axios';
import cookie from '@/ipc/cookie';
import { IPC } from '@common/constants';
import {
  type SearchOptions,
  type SearchResult,
  type FetchOptions,
  type FetchResult,
  type SongRecord,
  type SongListRecord,
  SearchType,
  defaultFetchOptions,
  getHtmlTextContent,
} from '../fetch';

const TAG = '[kuwo]';

function convert2song(song: Record<string, any>) {
  return <SongRecord>{
    mid: song.rid,
    title: getHtmlTextContent(song.name),
    artist: getHtmlTextContent(song.artist),
    artist_id: `kwartist_${song.artistid}`,
    album: getHtmlTextContent(song.album),
    album_id: `kwalbum_${song.albumid}`,
    platform: 'kuwo',
    source_url: `https://www.kuwo.cn/play_detail/${song.rid}`,
    img_url: song.pic,
    lyric_url: song.rid,
  };
}

function convert2songList(record: Record<string, any>) {
  return <SongListRecord>{
    dissid: record.id,
    title: getHtmlTextContent(record.name),
    platform: 'kuwo',
    source_url: `https://www.kuwo.cn/playlist_detail/${record.id}`,
    img_url: record.img,
    author: getHtmlTextContent(record.uname),
    count: record.total,
  };
}

async function kw_get_token(forceUpdateCookie = false) {
  const domain = 'https://www.kuwo.cn';
  const name = 'kw_token';

  if (forceUpdateCookie) {
    await window.ipcRenderer.invoke(IPC.设置酷我cookie, { url: domain, name });
    // TODO: 使用 Web 天然支持的 set cookie
    // await axios.get(domain);
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
  let response = await axios.get(url, { headers: { csrf: token[0]?.value ?? '' } });
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
    list: response.data.data.list.map((item: Record<string, any>) => search_type === SearchType.单曲
      ? convert2song(item)
      : convert2songList(item),
    ),
    page_num,
    page_size,
    total: response.data.data.total,
  };
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/kuwo.js#L304
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  const url = `http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${options.mid}&type=convert_url3&br=128kmp3`;

  const response = await axios.get(url);
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
