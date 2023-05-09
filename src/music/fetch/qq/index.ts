import axios from 'axios';
import type { TopsResponse } from './types/tops';
import type { TopSongListResponse } from './types/top-song-list';
import type {
  DiscRecordRaw,
  DiscResponse,
} from './types/disc';
import type { LyricResponse } from './types/lyric';
import {
  type TopSongOptions,
  type TopSongListRecord,
  type DiscResult,
  type LyricResult,
  type SearchOptions,
  type SearchResult,
  type SongRecord,
  type SongListRecord,
  type FetchOptions,
  type FetchResult,
  SearchType,
  defaultFetchOptions,
  getHtmlTextContent,
  UnicodeToAscii,
} from '..';
import type {
  SearchResponse,
  SongListRecordRaw,
  SongRecordRaw,
} from './types/search';
import type { FetchResponse } from './types/fetch';

const TAG = '[qq]';
export const ALL_CATEGORY_ID = 10000000;

function convertDisc2song(song: DiscRecordRaw) {
  return <SongRecord>{
    mid: song.songmid,
    title: getHtmlTextContent(song.songname),
    artist: getHtmlTextContent(song.singer[0].name),
    artist_id: `qqartist_${song.singer[0].mid}`,
    album: getHtmlTextContent(song.albumname),
    album_id: `qqalbum_${song.albummid}`,
    img_url: qq_get_image_url(song.albummid, 'album'),
    platform: 'qq',
    source_url: `https://y.qq.com/#type=song&mid=${song.songmid}&tpl=yqq_song_detail`,
    url: !qq_is_playable(song) ? '' : undefined,
  };
}

function convert2song(song: SongRecordRaw) {
  return <SongRecord>{
    mid: song.mid,
    title: getHtmlTextContent(song.name),
    artist: getHtmlTextContent(song.singer[0].name),
    artist_id: `qqartist_${song.singer[0].mid}`,
    album: getHtmlTextContent(song.album.name),
    album_id: `qqalbum_${song.album.mid}`,
    img_url: qq_get_image_url(song.album.mid, 'album'),
    platform: 'qq',
    source_url: `https://y.qq.com/#type=song&mid=${song.mid}&tpl=yqq_song_detail`,
    url: '',
  };
}

function convert2songList(record: SongListRecordRaw) {
  return <SongListRecord>{
    discId: record.dissid,
    title: getHtmlTextContent(record.dissname),
    platform: 'qq',
    source_url: `https://y.qq.com/n/ryqq/playlist/${record.dissid}`,
    img_url: record.imgurl,
    author: UnicodeToAscii(record.creator.name),
    count: record.song_count,
  };
}

function qq_get_image_url(qqimgid: string, img_type: 'artist' | 'album') {
  if (qqimgid == null) {
    return '';
  }
  let category = '';
  if (img_type === 'artist') {
    category = 'T001R300x300M000';
  }
  if (img_type === 'album') {
    category = 'T002R300x300M000';
  }
  const s = category + qqimgid;
  return `https://y.gtimg.cn/music/photo_new/${s}.jpg`;
}

function qq_is_playable(song: DiscRecordRaw) {
  const switch_flag = song.switch.toString(2).split('');
  switch_flag.pop();
  switch_flag.reverse();
  // flag switch table meaning:
  // ["play_lq", "play_hq", "play_sq", "down_lq", "down_hq", "down_sq", "soso",
  //  "fav", "share", "bgm", "ring", "sing", "radio", "try", "give"]
  const play_flag = switch_flag[0];
  const try_flag = switch_flag[13];
  return play_flag === '1' || (play_flag === '1' && try_flag === '1');
}

// ----------------------------------------------------------------------

/**
 * 1. 获取热榜 - 即 `getTopSongList(filterId === 'toplist')`
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L10
 */
async function getTops() {
  const url =
    'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg?g_tk=5381&inCharset=utf-8&outCharset=utf-8&notice=0&format=json&uin=0&needNewCode=1&platform=h5';

  const response = await axios.get<TopsResponse>(url);
  return response.data.data.topList.map<TopSongListRecord>(item => ({
    dissid: item.id,
    cover_img_url: item.picUrl,
    source_url: `https://y.qq.com/n/yqq/toplist/${item.id}.html`,
    title: item.topTitle,
  }));
}

/**
 * 2. 根据热榜取歌单
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L38
 */
export async function getTopSongList({
  filterId = ALL_CATEGORY_ID,
  offset = 0,
  size = 24,
}: TopSongOptions = {}) {
  const url =
    'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg' +
    `?picmid=1&rnd=${Math.random()}&g_tk=732560869` +
    '&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8' +
    '&notice=0&platform=yqq.json&needNewCode=0' +
    `&categoryId=${filterId}&sortId=5&sin=${offset}&ein=${size + offset}`;

  const response = await axios.get<TopSongListResponse>(url);
  return response.data.data.list.map<TopSongListRecord>(item => ({
    dissid: item.dissid,
    cover_img_url: item.imgurl,
    source_url: `https://y.qq.com/n/ryqq/playlist/${item.dissid}`,
    title: getHtmlTextContent(item.dissname),
  }));
}

/**
 * 3. 根据歌单获取歌单下所有音乐
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L228
 */
export async function getDisc(dissid: string): Promise<DiscResult> {
  const url =
    'https://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg' +
    '?type=1&json=1&utf8=1&onlysong=0' +
    `&nosign=1&disstid=${dissid}&g_tk=5381&loginUin=0&hostUin=0` +
    '&format=json&inCharset=GB2312&outCharset=utf-8&notice=0' +
    '&platform=yqq&needNewCode=0';

  const response = await axios.get<DiscResponse>(url);
  const { data } = response;

  return {
    list: data.cdlist[0].songlist.map((item) => convertDisc2song(item)),
    info: {
      discId: dissid,
      title: data.cdlist[0].dissname,
      img_url: data.cdlist[0].logo,
      platform: 'qq',
      source_url: `https://y.qq.com/n/ryqq/playlist/${dissid}`,
    },
  };
}

/**
 * 4.1 获取歌词
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L517
 */
export async function lyric(songmid: string | number): Promise<LyricResult> {
  const url =
    'https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg' +
    `?songmid=${songmid}&g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&nobase64=1`;

  const response = await axios.get<LyricResponse>(url);
  const { data } = response;
  const lrc = data.lyric || '';
  const tlrc = data.trans.replace(/\/\//g, '') || '';

  return {
    lyric: lrc,
    tlyric: tlrc,
  };
}

/**
 * 4.2 搜索音乐
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L340
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L153 - 调用处
 */
export async function searchMusic(options: SearchOptions): Promise<SearchResult> {
  const {
    keywords,
    search_type,
    page_num,
    page_size,
  } = defaultFetchOptions(options);

  // https://github.com/lyswhut/lx-music-desktop/blob/v1.22.3/src/renderer/utils/music/tx/musicSearch.js
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  const response = await axios.post<SearchResponse>(url, {
    comm: {
      ct: '19',
      cv: '1859',
      uin: '0',
    },
    req: {
      method: 'DoSearchForQQMusicDesktop',
      module: 'music.search.SearchCgiService',
      param: {
        grp: 1,
        page_num,
        num_per_page: page_size,
        query: keywords,
        search_type,
      },
    },
  });

  const { data } = response;
  let list = [];
  let total = 0;
  if (search_type === SearchType.单曲) {
    list = data.req.data.body.song.list.map((item) => convert2song(item));
    total = data.req.data.meta.sum;
  } else { // SearchType.歌单
    list = data.req.data.body.songlist.list.map((item) => convert2songList(item));
    total = data.req.data.meta.sum;
  }

  return {
    search_type,
    list,
    page_num,
    page_size,
    total,
  } as any;
}

/**
 * 5. 获取音乐
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L418
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  const { mid: songId } = options;
  const target_url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
  // thanks to https://github.com/Rain120/qq-music-api/blob/2b9cb811934888a532545fbd0bf4e4ab2aea5dbe/routers/context/getMusicPlay.js
  const guid = '10000';
  const songmidList = [songId];
  const uin = '0';

  const fileType = '320';
  const fileConfig = {
    m4a: {
      s: 'C400',
      e: '.m4a',
      bitrate: 'M4A',
    },
    128: {
      s: 'M500',
      e: '.mp3',
      bitrate: '128kbps',
    },
    320: {
      s: 'M800',
      e: '.mp3',
      bitrate: '320kbps',
    },
    ape: {
      s: 'A000',
      e: '.ape',
      bitrate: 'APE',
    },
    flac: {
      s: 'F000',
      e: '.flac',
      bitrate: 'FLAC',
    },
  };
  const fileInfo = fileConfig[fileType];
  const file =
    songmidList.length === 1 &&
    `${fileInfo.s}${songId}${songId}${fileInfo.e}`;

  const reqData = {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        filename: file ? [file] : [],
        guid,
        songmid: songmidList,
        songtype: [0],
        uin,
        loginflag: 1,
        platform: '20',
      },
    },
    loginUin: uin,
    comm: {
      uin,
      format: 'json',
      ct: 24,
      cv: 0,
    },
  };
  const params = {
    format: 'json',
    data: JSON.stringify(reqData),
  };
  const response = await axios.get<FetchResponse>(target_url, { params });
  const { data } = response;
  const { purl } = data.req_0.data.midurlinfo[0];

  if (purl === '') {
    // vip
    return {
      platform: 'qq',
      error: '[QQ] VIP 音乐 :(',
    };
  }

  const url = data.req_0.data.sip[0] + purl;
  // @ts-ignore
  const prefix = purl.slice(0, 4);
  const found = Object.values(fileConfig).filter((i) => i.s === prefix);
  const bitrate = found.length > 0 ? found[0].bitrate : undefined;
  return {
    platform: 'qq',
    url,
    bitrate,
  };
}
