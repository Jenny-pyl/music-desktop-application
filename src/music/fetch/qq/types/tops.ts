export interface TopsResponse {
  "code": 0,
  "subcode": 0,
  "message": "",
  "default": 0,
  "data": {
    "topList": [
      {
        "id": 4,
        "listenCount": 7953220,
        "picUrl": "http://y.gtimg.cn/music/photo_new/T003R300x300M000002EBFPE3gFDAF.jpg",
        "songList": [
          {
            "singername": "LE SSERAFIM/Nile Rodgers",
            "songname": "UNFORGIVEN (feat. Nile Rodgers)"
          },
          {
            "singername": "张碧晨",
            "songname": "开往早晨的午夜"
          },
          {
            "singername": "aespa (에스파)/nævis",
            "songname": "Welcome To MY World (Feat. nævis)"
          }
        ],
        "topTitle": "巅峰榜·流行指数",
        "type": 0
      }
    ]
  }
}

export type TopsRecordRaw = TopsResponse['data']['topList'][0]
