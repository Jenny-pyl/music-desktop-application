import axios from 'axios';
import type { CategoryRecord, CategoryResponse } from './types';

export const ALL_CATEGORY_ID = 10000000;

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

function getHtmlTextContent(html: string) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html').body.textContent ?? '';
}
