import axios from 'axios';
import cookie from '@/ipc/cookie';
import forge, { cipher } from 'node-forge';
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

function _aes_encrypt(text: string, sec_key: string, algo: cipher.Algorithm) {
  const cipher = forge.cipher.createCipher(algo, sec_key);
  cipher.start({ iv: '0102030405060708' });
  cipher.update(forge.util.createBuffer(text));
  cipher.finish();

  return cipher.output;
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

function setCookie() {
  const expire = (new Date().getTime() + 1e3 * 60 * 60 * 24 * 365 * 100) / 1000;
  cookie.set({
    url: 'https://interface3.music.163.com',
    name: 'os',
    value: 'pc',
    expirationDate: expire,
  });
}

// ----------------------------------------------------------------------

/**
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
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/netease.js#L344
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  setCookie();

  const target_url = `https://interface3.music.163.com/eapi/song/enhance/player/url`;
  const eapiUrl = '/api/song/enhance/player/url';

  const d = {
    ids: `[${options.mid}]`,
    br: 999000,
  };
  const data = eapi(eapiUrl, d);
  const response = await axios.post(target_url, new URLSearchParams(data));
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
