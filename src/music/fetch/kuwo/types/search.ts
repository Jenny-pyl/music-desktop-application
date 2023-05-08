export interface SearchResponse {
  "code": 200,
  "curTime": 1683559250761,
  "data": {
    "total": "138",
    "list": [
      {
        "musicrid": "MUSIC_499778",
        "barrage": "0",
        "artist": "张芸京",
        "mvpayinfo": {
          "play": "0",
          "vid": "8074982",
          "download": "0"
        },
        "pic": "https://img4.kuwo.cn/star/albumcover/120/50/26/402483447.jpg",
        "isstar": 0,
        "rid": 499778,
        "duration": 214,
        "score100": "81",
        "content_type": "0",
        "track": 0,
        "hasLossless": false,
        "hasmv": 1,
        "album": "破天荒",
        "albumid": "36115",
        "pay": "16711935",
        "artistid": 5219,
        "albumpic": "https://img4.kuwo.cn/star/albumcover/120/50/26/402483447.jpg",
        "originalsongtype": 1,
        "songTimeMinutes": "03:34",
        "isListenFee": true,
        "pic120": "https://img4.kuwo.cn/star/albumcover/120/50/26/402483447.jpg",
        "name": "偏爱-《仙剑奇侠传3》电视剧插曲",
        "online": 1,
        "payInfo": {
          "nplay": "111111111111",
          "play": "1111",
          "overseas_nplay": "0",
          "local_encrypt": "1",
          "limitfree": "0",
          "refrain_start": "15000",
          "feeType": {
            "song": "1",
            "album": "0",
            "vip": "1",
            "bookvip": "0"
          },
          "ndown": "111111111111",
          "download": "1111",
          "cannotDownload": "0",
          "overseas_ndown": "0",
          "cannotOnlinePlay": "0",
          "listen_fragment": "1",
          "refrain_end": "37000",
          "paytagindex": {
            "S": 2,
            "F": 3,
            "ZP": 6,
            "H": 1,
            "ZPGA201": 9,
            "ZPLY": 11,
            "HR": 4,
            "L": 0,
            "ZPGA501": 10,
            "DB": 7,
            "AR501": 8
          },
          "tips_intercept": "0"
        }
      }
    ]
  },
  "msg": "success",
  "profileId": "site",
  "reqId": "dcafc493a5bb37420e6064cc82ea430f",
  "tId": ""
}

export interface SearchResponse {
  "success": false,
  "message": "CSRF Token Not Found!",
  "now": "2023-05-08T15:06:26.063Z",
}

export type SongRecordRaw = SearchResponse['data']['list'][0]
