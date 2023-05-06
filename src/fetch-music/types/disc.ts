import type { CategoryRecord } from './category'
import type { SongRecord } from './search'

export interface DiscResponse {
  "code": 0,
  "subcode": 0,
  "accessed_plaza_cache": 0,
  "accessed_favbase": 1,
  "login": "on**",
  "cdnum": 1,
  "cdlist": [
    {
      "disstid": "6268734727",
      "dir_show": 1,
      "owndir": 0,
      "dirid": 3,
      "coveradurl": "",
      "dissid": 6268734,
      "login": "on**",
      "uin": "oicl7w4AoKn5",
      "encrypt_uin": "oicl7w4AoKn5",
      "dissname": "单曲循环：传遍大街小巷的新潮风",
      "logo": "http://qpic.y.qq.com/music_cover/Lbibx7GJ6ZzToOtt2HL7x0FWJj3pC7oBTgS02tVXkIibKU0ygUhNfcKA/300?n=1",
      "pic_mid": "",
      "album_pic_mid": "",
      "pic_dpi": 300,
      "isAd": 0,
      "desc": "或许你会在某个街角路过一家咖啡厅一家餐厅时听见-些非常熟悉的老歌，停下脚步细细聆听，心中升起一些温暖的情愫，感觉整个世界都变得柔和，这就是老歌的魅力。有些歌你从小听过来,从来没有刻意去学.唱,但总是在听见的时候就忍不住跟着哼，脑海里出现的是儿时吃冰棒的画面，一家人围坐一团一起看电视的画面，那种记忆藏在歌里.与旋律融为一体。<br>",
      "ctime": 1546343553,
      "mtime": 0,
      "headurl": "https://pic6.y.qq.com/qqmusic/avatar/6f69636c377734416f4b6e35-1644226375",
      "ifpicurl": "https://y.qq.com/music/common/upload/t_cm3_photo_publish/2312599.png",
      "nick": "看不知名的海",
      "nickname": "看不知名的海",
      "type": 2,
      "singerid": 0,
      "singermid": "",
      "isvip": 1,
      "isdj": 0,
      "tags": [
        {
          "id": 6,
          "name": "流行",
          "pid": 6
        },
        {
          "id": 165,
          "name": "国语",
          "pid": 165
        }
      ],
      "songnum": 262,
      "songids": "410465065,405494913,224827783,371364773,362910046,404200463,394086810,398282803,384263699,473137,257621,380267194,202057627,1030353,9063002,332733437,400435407,272125057,337085743,205137019,5063367,331839675,310640682,97759,310637306,371352670,7416139,396710011,312113879,97773,102193483,362892106,232967259,337951848,316184139,330621486,218659640,102174489,350437637,356448017,358869776,378594475,405007729,4830766,368139519,102793291,406405348,109291468,353076569,202371397,5106430,406071231,680284,395761645,345707924,102636799,380261114,103002617,449200,105526949,273032705,5105986,449198,209340068,823568,347233622,5016169,102415346,224278998,107192538,396112160,405007727,232965795,261268859,393960841,330621480,351491248,235883438,330621483,106034300,447253,354817853,105388642,330621484,211988085,399068181,215951234,1333803,229103825,294095266,102066448,329960082,202553248,384107426,105163752,309058164,268760037,372639235,393949802,212656958,360410830,938054,293700875,102065756,104882784,242254267,95272,101813361,219165837,233097707,213773480,247817510,397629060,377417449,291692590,764259,381363830,350596811,214322623,339247202,200282136,361947418,384599335,370388319,102425546,371312735,3585884,7112743,326584182,380533983,202882590,380582517,247261229,381123034,102388821,337374165,382184359,374725336,377304727,216124830,334997571,449201,285043453,102350740,331251776,95292,104775877,718477,372088017,449205,321249876,214093439,368407555,212877015,7063423,361608130,324803060,370388114,356185380,213722048,101091484,244905368,358034972,95199,335005029,344531297,305023607,109391882,466722,281506863,212675141,337805783,109122270,337374299,270283298,304201349,319802110,97771,317956947,95306,435533,102426570,204586755,105519196,278659043,331723843,338067506,308435624,205357640,292476167,624649,319798950,299366789,312214056,340010190,346165454,102296985,283657774,214182478,526713,447257,315812068,648231,234146938,101555425,261268980,213958134,235802819,308126719,309848434,254111357,299515847,314846798,277968666,318200470,333901100,107192078,277342515,310337163,268686156,203514624,307167242,290702057,291911135,334748404,315481516,316051220,244135851,293695482,320315208,200255722,215540451,290330693,317020314,321583991,102388808,311429048,416764,447260,278474390,235839585,203452364,104883226,306688724,306961926,212606735,258222697,5408217,213470055,246492240,5063375,236683792,294235538,218224537,273429727,244712794,273790050,265649028,201428089,233126321,410316,225773250",
      "songtypes": "13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13",
      "disstype": 0,
      "dir_pic_url2": "",
      "song_update_time": 0,
      "song_update_num": 0,
      "total_song_num": 262,
      "song_begin": 0,
      "cur_song_num": 262,
      "songlist": [
        {
          "albumdesc": "",
          "albumid": 37788273,
          "albummid": "000yBLV907nKip",
          "albumname": "想我们",
          "alertid": 2,
          "belongCD": 1,
          "cdIdx": 0,
          "interval": 241,
          "isonly": 0,
          "label": "0",
          "msgid": 14,
          "pay": {
            "payalbum": 0,
            "payalbumprice": 0,
            "paydownload": 1,
            "payinfo": 1,
            "payplay": 0,
            "paytrackmouth": 1,
            "paytrackprice": 200,
            "timefree": 0
          },
          "preview": {
            "trybegin": 0,
            "tryend": 0,
            "trysize": 960887
          },
          "rate": 0,
          "singer": [
            {
              "id": 2352657,
              "mid": "003H6zJa2P07Uu",
              "name": "谢婧颖"
            }
          ],
          "size128": 3867152,
          "size320": 9667590,
          "size5_1": 0,
          "sizeape": 0,
          "sizeflac": 50968519,
          "sizeogg": 5384204,
          "songid": 410465065,
          "songmid": "001VE2EB1kafPl",
          "songname": "想我们",
          "songorig": "想我们",
          "songtype": 0,
          "strMediaMid": "001VE2EB1kafPl",
          "stream": 0,
          "switch": 16889603,
          "type": 0,
          "vid": ""
        }
      ],
      "visitnum": 148434335,
      "cmtnum": 0,
      "buynum": 0,
      "scoreavage": "0.0",
      "scoreusercount": 0
    }
  ],
  "realcdnum": 1
}

export type DiscRecordRaw = DiscResponse['cdlist'][0]['songlist'][0]

export interface DiscResult {
  list: SongRecord[]
  info: CategoryRecord
}
