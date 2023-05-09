import axios from 'axios';
import cookie from '@/ipc/cookie';
import forge, { cipher } from 'node-forge';
import async from 'async';
import type { TopsResponse } from './types/tops';
import type { TopSongListResponse } from './types/top-song-list';
import type {
  DiscResponse,
  DisctrackIdsRaw,
  DiscDetailResponse,
} from './types/disc';
import type { LyricResponse } from './types/lyric';
import {
  type TopSongOptions,
  type TopSongListRecord,
  type DiscResult,
  type LyricResult,
  type SearchOptions,
  type SearchResult,
  type FetchOptions,
  type FetchResult,
  type SongRecord,
  type SongListRecord,
  SearchType,
  defaultFetchOptions,
  getParameterByName,
} from '..';
import type {
  SearchResponse,
  SongRecordRaw,
  SongListRecordRaw,
} from './types/search';
import type { FetchResponse } from './types/fetch';

const TAG = '[netease]';

function convert2song(song: SongRecordRaw) {
  return <SongRecord>{
    mid: song.id,
    title: song.name,
    artist: song.artists[0].name,
    artist_id: song.artists[0].id,
    album: song.album.name,
    album_id: song.album.id,
    platform: 'netease',
    source_url: `https://music.163.com/#/song?id=${song.id}`,
    img_url: song.album.picUrl,
    url: !is_playable(song) ? '' : undefined,
  };
}

function convert2songList(record: SongListRecordRaw) {
  return <SongListRecord>{
    discId: record.id,
    title: record.name,
    platform: 'netease',
    source_url: `https://music.163.com/#/playlist?id=${record.id}`,
    img_url: record.coverImgUrl,
    url: record.id,
    author: record.creator.nickname,
    count: record.trackCount,
  };
}

function is_playable(song: Record<string, any>) {
  return song.fee !== 4 && song.fee !== 1;
}

function _create_secret_key(size: number) {
  const result = [];
  const choice = '012345679abcdef'.split('');
  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * choice.length);
    result.push(choice[index]);
  }
  return result.join('');
}

function _aes_encrypt(text: string, sec_key: string, algo: cipher.Algorithm) {
  const cipher = forge.cipher.createCipher(algo, sec_key);
  cipher.start({ iv: '0102030405060708' });
  cipher.update(forge.util.createBuffer(text));
  cipher.finish();

  return cipher.output;
}

function _rsa_encrypt(text: string, pubKey: string, modulus: string) {
  text = text.split('').reverse().join(''); // eslint-disable-line no-param-reassign
  const n = new forge.jsbn.BigInteger(modulus, 16);
  const e = new forge.jsbn.BigInteger(pubKey, 16);
  const b = new forge.jsbn.BigInteger(forge.util.bytesToHex(text), 16);
  const enc = b.modPow(e, n).toString(16).padStart(256, '0');
  return enc;
}

// refer to https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/util/crypto.js
function eapi(url: string, object: Record<string, any>) {
  const eapiKey = 'e82ckenh8dichen8';

  const text = typeof object === 'object' ? JSON.stringify(object) : object;
  const message = `nobody${url}use${text}md5forencrypt`;
  const digest = forge.md5
    .create()
    .update(forge.util.encodeUtf8(message))
    .digest()
    .toHex();
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;

  return {
    params: _aes_encrypt(data, eapiKey, 'AES-ECB').toHex().toUpperCase(),
  };
}

function weapi(text: string | Record<string, any>) {
  const modulus =
    '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b72' +
    '5152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbd' +
    'a92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe48' +
    '75d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
  const nonce = '0CoJUm6Qyw8W8jud';
  const pubKey = '010001';
  text = JSON.stringify(text); // eslint-disable-line no-param-reassign
  const sec_key = _create_secret_key(16);
  const enc_text = btoa(
    _aes_encrypt(
      btoa(_aes_encrypt(text, nonce, 'AES-CBC').data),
      sec_key,
      'AES-CBC'
    ).data
  );
  const enc_sec_key = _rsa_encrypt(sec_key, pubKey, modulus);
  const data = {
    params: enc_text,
    encSecKey: enc_sec_key,
  };

  return data;
}

async function ensure_netease_cookie() {
  const domain = 'https://music.163.com';
  const nuidName = '_ntes_nuid';
  const nnidName = '_ntes_nnid';

  const cookies = await cookie.get({ url: domain, name: nuidName });
  if (!cookies.length) {
    const nuidValue = _create_secret_key(32);
    const nnidValue = `${nuidValue},${new Date().getTime()}`;
    // netease default cookie expire time: 100 years
    const expire = (new Date().getTime() + 1e3 * 60 * 60 * 24 * 365 * 100) / 1000;
    await cookie.set({
      url: domain,
      name: nuidName,
      value: nuidValue,
      expirationDate: expire,
    });
    await cookie.set({
      url: domain,
      name: nnidName,
      value: nnidValue,
      expirationDate: expire,
    });
  }
}

async function ensure_interface3_cookie() {
  const expire = (new Date().getTime() + 1e3 * 60 * 60 * 24 * 365 * 100) / 1000;
  await cookie.set({
    url: 'https://interface3.music.163.com',
    name: 'os',
    value: 'pc',
    expirationDate: expire,
  });
}

function split_array(myarray: DisctrackIdsRaw, size: number) {
  const count = Math.ceil(myarray.length / size);
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(myarray.slice(i * size, (i + 1) * size));
  }
  return result as DisctrackIdsRaw[];
}

async function getDiscSongDetail(playlist_tracks: DisctrackIdsRaw) {
  const target_url = 'https://music.163.com/weapi/v3/song/detail';
  const track_ids = playlist_tracks.map((i) => i.id);
  const d = {
    c: `[${track_ids.map((id) => `{"id":${id}}`).join(',')}]`,
    ids: `[${track_ids.join(',')}]`,
  };
  const data = weapi(d);
  const response = await axios.post<DiscDetailResponse>(target_url, new URLSearchParams(data));
  return response.data.songs.map<SongRecord>(track_json => ({
    mid: track_json.id,
    title: track_json.name,
    artist: track_json.ar[0].name,
    artist_id: track_json.ar[0].id,
    album: track_json.al.name,
    album_id: track_json.al.id,
    platform: 'netease',
    source_url: `https://music.163.com/#/song?id=${track_json.id}`,
    img_url: track_json.al.picUrl,
  }));
}

// ----------------------------------------------------------------------

/**
 * 1. 获取热榜 - 即 `getTopSongList(filterId === 'toplist')`
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L78
 */
async function getTops() {
  const url = 'https://music.163.com/weapi/toplist/detail';
  const data = weapi({});
  const response = await axios.post<TopsResponse>(url, new URLSearchParams(data));
  return response.data.list.map<TopSongListRecord>(item => ({
    dissid: item.id,
    cover_img_url: item.coverImgUrl,
    source_url: `https://music.163.com/#/playlist?id=${item.id}`,
    title: item.name,
  }));
}

/**
 * 2. 根据热榜获取歌单
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L105
 */
export async function getTopSongList({
  filterId,
  offset,
  size = 24,
}: TopSongOptions = {}) {
  const order = 'hot';
  const filter = filterId == null ? '' : `&cat=${filterId}`;
  const target_url = offset == null
    ? `https://music.163.com/discover/playlist/?order=${order}${filter}`
    : `https://music.163.com/discover/playlist/?order=${order}${filter}&limit=${size}&offset=${offset}`;

  const response = await axios.get<TopSongListResponse>(target_url);
  const { data } = response;
  const list_elements = Array.from(
    new DOMParser()
      .parseFromString(data, 'text/html')
      .getElementsByClassName('m-cvrlst')[0].children
  );

  return list_elements.map<TopSongListRecord>((item) => {
    const dissid = getParameterByName(
      'id',
      item.getElementsByTagName('div')[0].getElementsByTagName('a')[0]
        .href
    ) as string;

    return {
      cover_img_url: item
        .getElementsByTagName('img')[0]
        .src.replace('140y140', '512y512'),
      dissid,
      source_url: `https://music.163.com/#/playlist?id=${dissid}`,
      title: item
        .getElementsByTagName('div')[0]
        .getElementsByTagName('a')[0].title,
    };
  });
}

/**
 * 3. 根据歌单获取歌单下所有音乐
 */
export async function getDisc(dissid: string): Promise<DiscResult> {
  await ensure_netease_cookie();

  // special thanks for @Binaryify
  // https://github.com/Binaryify/NeteaseCloudMusicApi
  const target_url = 'https://music.163.com/weapi/v3/playlist/detail';
  const limit = 240;
  const d = {
    id: dissid,
    offset: 0,
    total: true,
    limit,
    n: limit,
    csrf_token: '',
  };
  const data = weapi(d);
  const response = await axios.post<DiscResponse>(target_url, new URLSearchParams(data));
  const { data: res_data } = response;
  const info: SongListRecord = {
    discId: dissid,
    title: res_data.playlist.name,
    platform: 'netease',
    img_url: res_data.playlist.coverImgUrl,
    source_url: `https://music.163.com/#/playlist?id=${dissid}`,
  };
  const max_allow_size = limit; // 限制 getDiscSongDetail 请求数据数量
  const trackIdsArray = split_array(
    res_data.playlist.trackIds,
    max_allow_size,
  );

  return new Promise<DiscResult>(resolve => {
    async.concat<DisctrackIdsRaw, SongRecord>(
      trackIdsArray,
      (trackIds, callback) => { // 这里不能用 async function - 很坑 😭
        getDiscSongDetail(trackIds).then(list => callback(null, list));
      },
      (err, list) => {
        resolve({
          list: list as SongRecord[],
          info,
        });
      }
    );
  });
}

/**
 * 4.1 获取歌词
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L535
 */
export async function lyric(songmid: string | number): Promise<LyricResult> {
  // use chrome extension to modify referer.
  const target_url = 'https://music.163.com/weapi/song/lyric?csrf_token=';
  const csrf = '';
  const d = {
    id: songmid,
    lv: -1,
    tv: -1,
    csrf_token: csrf,
  };
  const data = weapi(d);
  const response = await axios.post<LyricResponse>(target_url, new URLSearchParams(data));

  const { data: res_data } = response;
  let lrc = '';
  let tlrc = '';
  if (res_data.lrc != null) {
    lrc = res_data.lrc.lyric;
  }
  if (res_data.tlyric != null && res_data.tlyric.lyric != null) {
    // eslint-disable-next-line no-control-regex
    tlrc = res_data.tlyric.lyric.replace(/(|\\)/g, '');
    tlrc = tlrc.replace(/[\u2005]+/g, ' ');
  }

  return {
    lyric: lrc,
    tlyric: tlrc,
  };
}

/**
 * 4.2 搜索音乐
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L390
 */
export async function searchMusic(options: SearchOptions): Promise<SearchResult> {
  const {
    keywords,
    page_num,
    page_size,
    search_type,
  } = defaultFetchOptions(options);

  // use chrome extension to modify referer.
  const target_url = 'https://music.163.com/api/search/pc';

  const type = {
    [SearchType.单曲]: '1',
    [SearchType.歌单]: '1000',
  }[search_type];

  const req_data: Record<string, any> = {
    s: keywords,
    offset: page_size * (page_num - 1),
    limit: page_size,
    type,
  };

  const response = await axios.post<SearchResponse>(target_url, new URLSearchParams(req_data));
  const { data } = response;

  let result = [];
  let total = 0;

  if (search_type === SearchType.单曲) {
    result = data.result.songs.map((item) => convert2song(item));
    total = data.result.songCount;
  } else { //SearchType.歌单
    result = data.result.playlists.map((item) => convert2songList(item));
    total = data.result.playlistCount;
  }

  return {
    type: search_type,
    list: result as any,
    page_num,
    page_size,
    total,
  };
}

/**
 * 5. 获取音乐
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L344
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  await ensure_interface3_cookie();

  const target_url = `https://interface3.music.163.com/eapi/song/enhance/player/url`;
  const eapiUrl = '/api/song/enhance/player/url';

  const d = {
    ids: `[${options.mid}]`,
    br: 999000,
  };
  const data = eapi(eapiUrl, d);
  const response = await axios.post<FetchResponse>(target_url, new URLSearchParams(data));
  const { data: res_data } = response;
  const { url, br } = res_data.data[0];
  if (url != null) {
    return {
      platform: 'netease',
      url,
      bitrate: `${(br / 1000).toFixed(0)}kbps`,
    };
  }

  console.warn(TAG, 'fetchMusic', response.data);

  return {
    platform: 'netease',
    error: '[网易] known error',
  };
}
