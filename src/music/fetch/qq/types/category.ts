export interface CategoryResponse {
  "code": 0,
  "subcode": 0,
  "message": "",
  "default": 0,
  "data": {
    "uin": 0,
    "categoryId": 10000000,
    "sortId": 5,
    "sum": 11758,
    "sin": 0,
    "ein": 29,
    "list": [
      {
        "dissid": "7857152612",
        "createtime": "2021-02-01",
        "commit_time": "2021-02-01",
        "dissname": "想把这些神仙翻唱藏进你的耳朵",
        "imgurl": "http://p.qpic.cn/music_cover/l2TjT4xsWkl0J4c5Q2Dvc8IesZ8JtGx6gpQ6CWJHRUZgIv1gDa4w3Q/600?n=1",
        "introduction": "",
        "listennum": 45451461,
        "score": 0.0,
        "version": 0,
        "creator": {
          "type": 2,
          "qq": 3104417409,
          "encrypt_uin": "oi6z7ev57ivzNv**",
          "name": "QQ音乐银河计划",
          "isVip": 2,
          "avatarUrl": "",
          "followflag": 0
        }
      }
    ]
  }
}

export type CategoryRecordRaw = CategoryResponse['data']['list'][0]

export interface CategoryRecord {
  // qq 音乐的接口也是一坨 💩 有接口用 dissid 有接口用 disstid 不清楚是什么意思
  dissid: string
  cover_img_url: string
  title: string
  source_url: string
}
