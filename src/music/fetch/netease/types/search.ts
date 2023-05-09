export interface SearchResponse {
  "result": {
    /** 单曲 */
    "songs": [
      {
        "name": "像鱼",
        "id": 1331819951,
        "position": 1,
        "alias": [],
        "status": 0,
        "fee": 8,
        "copyrightId": 1415874,
        "disc": "1",
        "no": 1,
        "artists": [
          {
            "name": "王贰浪",
            "id": 14312549,
            "picId": 0,
            "img1v1Id": 0,
            "briefDesc": "",
            "picUrl": "",
            "img1v1Url": "https://p3.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
            "albumSize": 0,
            "alias": [],
            "trans": "",
            "musicSize": 0
          }
        ],
        "album": {
          "name": "像鱼",
          "id": 74793881,
          "idStr": "74793881",
          "type": "Single",
          "size": 2,
          "picId": 109951163720047382,
          "blurPicUrl": "https://p3.music.126.net/ejEPGN6ulPSgCBXGq7dgqw==/109951163720047382.jpg",
          "companyId": 0,
          "pic": 109951163720047382,
          "picUrl": "https://p4.music.126.net/ejEPGN6ulPSgCBXGq7dgqw==/109951163720047382.jpg",
          "publishTime": 1544457600000,
          "description": "",
          "tags": "",
          "company": "伯音时代",
          "briefDesc": "",
          "artist": {
            "name": "",
            "id": 0,
            "picId": 0,
            "img1v1Id": 0,
            "briefDesc": "",
            "picUrl": "",
            "img1v1Url": "https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
            "albumSize": 0,
            "alias": [],
            "trans": "",
            "musicSize": 0
          },
          "songs": [],
          "alias": [],
          "status": 0,
          "copyrightId": 1415874,
          "commentThreadId": "R_AL_3_74793881",
          "artists": [
            {
              "name": "王贰浪",
              "id": 14312549,
              "picId": 0,
              "img1v1Id": 0,
              "briefDesc": "",
              "picUrl": "",
              "img1v1Url": "https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
              "albumSize": 0,
              "alias": [],
              "trans": "",
              "musicSize": 0
            }
          ],
          "picId_str": "109951163720047382"
        },
        "starred": false,
        "popularity": 100.0,
        "score": 100,
        "starredNum": 0,
        "duration": 285271,
        "playedNum": 0,
        "dayPlays": 0,
        "hearTime": 0,
        "ringtone": null,
        "crbt": null,
        "audition": null,
        "copyFrom": "",
        "commentThreadId": "R_SO_4_1331819951",
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "copyright": 0,
        "mvid": 0,
        "bMusic": {
          "name": null,
          "id": 7238120785,
          "size": 4565462,
          "extension": "mp3",
          "sr": 44100,
          "dfsId": 0,
          "bitrate": 128000,
          "playTime": 285271,
          "volumeDelta": -34468.0
        },
        "mp3Url": "http://m2.music.126.net/hmZoNQaqzZALvVp0rE7faA==/0.mp3",
        "rtype": 0,
        "rurl": null,
        "hMusic": {
          "name": null,
          "id": 7238120791,
          "size": 11413514,
          "extension": "mp3",
          "sr": 44100,
          "dfsId": 0,
          "bitrate": 320000,
          "playTime": 285271,
          "volumeDelta": -38856.0
        },
        "mMusic": {
          "name": null,
          "id": 7238120783,
          "size": 6848146,
          "extension": "mp3",
          "sr": 44100,
          "dfsId": 0,
          "bitrate": 192000,
          "playTime": 285271,
          "volumeDelta": -36250.0
        },
        "lMusic": {
          "name": null,
          "id": 7238120785,
          "size": 4565462,
          "extension": "mp3",
          "sr": 44100,
          "dfsId": 0,
          "bitrate": 128000,
          "playTime": 285271,
          "volumeDelta": -34468.0
        }
      }
    ],
    "songCount": 225,
    /** 歌单 */
    "playlists": [
      {
        "id": 4955434326,
        "name": "像鱼（王贰浪）",
        "coverImgUrl": "https://p3.music.126.net/ejEPGN6ulPSgCBXGq7dgqw==/109951163720047382.jpg",
        "creator": {
          "nickname": "江南墨韵石桥细雨",
          "userId": 502575332,
          "userType": 0,
          "avatarUrl": null,
          "authStatus": 0,
          "expertTags": null,
          "experts": null
        },
        "subscribed": false,
        "trackCount": 44,
        "userId": 502575332,
        "playCount": 429872,
        "bookCount": 1235,
        "specialType": 0,
        "officialTags": null,
        "action": null,
        "actionType": null,
        "recommendText": null,
        "score": null,
        "description": null,
        "highQuality": false
      }
    ],
    "playlistCount": 267,
  },
  "code": 200
}

export type SongRecordRaw = SearchResponse['result']['songs'][0]
export type SongListRecordRaw = SearchResponse['result']['playlists'][0]
