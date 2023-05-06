import axios from 'axios';
import type { CategoryRecord, CategoryResponse } from './types/category';
import type {
  SearchResponse,
  SearchResult,
  SongListRecord,
  SongListRecordRaw,
  SongRecord,
  SongRecordRaw,
} from './types/search';

export const ALL_CATEGORY_ID = 10000000;

function getHtmlTextContent(html: string) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html').body.textContent ?? '';
}

function convert2song(record: SongRecordRaw) {
  return <SongRecord>{
    id: `qqtrack_${record.mid}`,
    title: getHtmlTextContent(record.name),
    artist: getHtmlTextContent(record.singer[0].name),
    artist_id: `qqartist_${record.singer[0].mid}`,
    album: getHtmlTextContent(record.album.name),
    album_id: `qqalbum_${record.album.mid}`,
    img_url: qq_get_image_url(record.album.mid, 'album'),
    source: 'qq',
    source_url: `https://y.qq.com/#type=song&mid=${record.mid}&tpl=yqq_song_detail`,
    url: '',
  };
}

function convert2songList(record: SongListRecordRaw) {
  return <SongListRecord>{
    id: `qqplaylist_${record.dissid}`,
    title: getHtmlTextContent(record.dissname),
    source: 'qq',
    source_url: `https://y.qq.com/n/ryqq/playlist/${record.dissid}`,
    img_url: record.imgurl,
    url: `qqplaylist_${record.dissid}`,
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

function UnicodeToAscii(str: string) {
  return str.replace(/&#(\d+);/g, () =>
    String.fromCharCode(arguments[1])
  );
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L38
 */
export async function getCategoryList({
  filterId = ALL_CATEGORY_ID,
  offset = 0,
}: {
  filterId?: number,
  offset?: number,
} = {}) {
  const url =
    'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg' +
    `?picmid=1&rnd=${Math.random()}&g_tk=732560869` +
    '&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8' +
    '&notice=0&platform=yqq.json&needNewCode=0' +
    `&categoryId=${filterId}&sortId=5&sin=${offset}&ein=${29 + offset}`;

  const response = await axios.get<CategoryResponse>(url);
  return response.data.data.list.map<CategoryRecord>(item => ({
    cover_img_url: item.imgurl,
    title: getHtmlTextContent(item.dissname),
    id: `qqplaylist_${item.dissid}`,
    source_url: `https://y.qq.com/n/ryqq/playlist/${item.dissid}`,
  }));
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L10
 */
export async function getTopCategoryList() {
  const url =
    'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg?g_tk=5381&inCharset=utf-8&outCharset=utf-8&notice=0&format=json&uin=0&needNewCode=1&platform=h5';

  const response = await axios.get(url);
  return response.data.data.topList.map((item: Record<string, string>) => ({
    cover_img_url: item.picUrl,
    id: `qqtoplist_${item.id}`,
    source_url: `https://y.qq.com/n/yqq/toplist/${item.id}.html`,
    title: item.topTitle,
  }));
}

export enum SearchType {
  单曲 = 0,
  歌单 = 3,
}

/**
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/provider/qq.js#L340
 * @see https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/loweb.js#L153 - 调用处
 */
export async function search({
  keywords,
  search_type = SearchType.单曲,
  page_num = 1,
  page_size = 24,
}: {
  keywords: string,
  search_type?: SearchType,
  page_num?: number,
  page_size?: number,
}): Promise<SearchResult> {
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
    type: search_type,
    list,
    page_num,
    page_size,
    total,
  } as any;
}
