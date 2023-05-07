import axios from 'axios';
import {
  type SearchOptions,
  type SearchResult,
  type FetchResult,
  type FetchOptions,
  type SongRecord,
  type SongListRecord,
  SearchType,
  MusicBitrate,
  defaultFetchOptions,
  uuid,
  getHtmlTextContent,
} from '../fetch';

const TAG = '[migu]';

function convert2song(song: Record<string, any>) {
  return <SongRecord>{
    mid: song.copyrightId,
    title: song.songName,
    artist: song.artists ? song.artists[0].name : song.singer,
    artist_id: `mgartist_${song.artists ? song.artists[0].id : song.singerId}`,
    album: song.albumId !== 1 ? song.album : '',
    album_id: song.albumId !== 1 ? `mgalbum_${song.albumId}` : 'mgalbum_',
    platform: 'migu',
    source_url: `https://music.migu.cn/v3/music/song/${song.copyrightId}`,
    img_url: song.albumImgs[1].img,
    lyric_url: song.lrcUrl,
    tlyric_url: song.trcUrl,
    quality: song.toneControl,
    song_id: song.songId,
  };
}

function convert2songList(record: Record<string, any>) {
  return <SongListRecord>{
    dissid: record.id,
    title: record.name,
    platform: 'migu',
    source_url: `https://music.migu.cn/v3/music/playlist/${record.id}`,
    img_url: record.musicListPicUrl,
    author: record.userName,
    count: record.musicNum,
  };
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/migu.js#L520
 */
export async function searchMusic(options: SearchOptions): Promise<SearchResult> {
  const {
    keywords,
    page_num,
    page_size,
    search_type,
  } = defaultFetchOptions(options);
  const sid = (uuid() + uuid()).replace(/-/g, '');

  let searchSwitch = '';
  let target_url =
    'https://jadeite.migu.cn/music_search/v2/search/searchAll?';

  if (search_type === SearchType.单曲) {
    searchSwitch = '{"song":1}'; // {"song":1,"album":0,"singer":0,"tagSong":1,"mvSong":0,"bestShow":1,"songlist":0,"lyricSong":0}
    target_url =
      `${target_url}sid=${sid}&isCorrect=1&isCopyright=1` +
      `&searchSwitch=${encodeURIComponent(searchSwitch)}&pageSize=${page_size}` +
      `&text=${encodeURIComponent(keywords)}&pageNo=${page_num}` +
      '&feature=1000000000&sort=1';
  } else { // SearchType.歌单
    searchSwitch = '{"songlist":1}';
    target_url =
      `${target_url}sid=${sid}&isCorrect=1&isCopyright=1` +
      `&searchSwitch=${encodeURIComponent(searchSwitch)}` +
      `&userFilter=%7B%22songlisttag%22%3A%5B%5D%7D&pageSize=${page_size}` +
      `&text=${encodeURIComponent(keywords)}&pageNo=${page_num}` +
      // + `&sort=1&userSort=%7B%22songlist%22%3A%22default%22%7D`;
      '&feature=0000000010&sort=1';
  }

  const deviceId = forge.md5
    .create()
    .update(uuid().replace(/-/g, ''))
    .digest()
    .toHex()
    .toLocaleUpperCase(); // 设备的UUID
  const timestamp = new Date().getTime();
  const signature_md5 = '6cdc72a439cef99a3418d2a78aa28c73'; // app签名证书的md5
  const text = `${keywords + signature_md5
    }yyapp2d16148780a1dcc7408e06336b98cfd50${deviceId}${timestamp}`;
  const sign = forge.md5
    .create(text)
    .update(forge.util.encodeUtf8(text))
    .digest()
    .toHex();
  const headers = {
    // android_id: 'db2cd8c4cdc1345f',
    appId: 'yyapp2',
    // brand: 'google',
    // channel: '0147151',
    deviceId,
    // HWID: '',
    // IMEI: '',
    // IMSI: '',
    // ip: '192.168.1.101',
    // mac: '02:00:00:00:00:00',
    // 'mgm-Network-standard': '01',
    // 'mgm-Network-type': '04',
    // mode: 'android',
    // msisdn: '',
    // OAID: '',
    // os: 'android 7.0',
    // osVersion: 'android 7.0',
    // platform: 'G011C',
    sign,
    timestamp,
    // ua: 'Android_migu',
    // uid: '',
    uiVersion: 'A_music_3.3.0',
    version: '7.0.4',
  };

  const response = await axios.get(target_url, { headers });
  const { data } = response;

  let list = [];
  let total = 0;

  if (search_type === SearchType.单曲) {
    if (data.songResultData.result) {
      list = data.songResultData.result.map((item: Record<string, any>) => convert2song(item));
      total = data.songResultData.totalCount;
    }
  } else { // SearchType.歌单
    if (data.songListResultData.result) {
      list = data.songListResultData.result.map((item: Record<string, any>) => convert2songList(item));
      total = data.songListResultData.totalCount;
    }
  }

  return {
    type: search_type,
    page_num,
    page_size,
    total,
    list,
  }
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/migu.js#L413
 */
export async function fetchMusic(options: FetchOptions): Promise<FetchResult> {
  const { mid, quality = 'PQ' } = options
  const target_url = `https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2?netType=01&resourceType=E&songId=${mid}&toneFlag=${quality}`;
  const response = await axios.get(target_url, {
    headers: {
      channel: '0146951',
      uid: 1234,
    },
  });

  let playUrl = response.data.data ? response.data.data.url : null;
  if (playUrl) {
    if (playUrl.startsWith('//')) {
      playUrl = `https:${playUrl}`;
    }
    const url = playUrl.replace(/\+/g, '%2B');

    return {
      platform: 'migu',
      url,
      bitrate: MusicBitrate[quality],
    }

  }

  console.warn(TAG, 'fetchMusic', response.data);

  return {
    platform: 'migu',
    error: '[咪咕] known error',
  };
}
