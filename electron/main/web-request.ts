import { session } from 'electron'

export function initWebRequest() {
  // https://www.electronjs.org/docs/latest/api/web-request
  session.defaultSession.webRequest.onBeforeSendHeaders({
    // https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/background.js#L42-L53
    urls: [
      'c.y.qq.com/',
      'i.y.qq.com/',
      'qqmusic.qq.com/',
      'music.qq.com/',
      'imgcache.qq.com/',
    ].map(url => `https://${url}*`),
  }, (details, callback) => {
    details.requestHeaders.origin = 'https://y.qq.com'
    details.requestHeaders.referer = 'https://y.qq.com/'
    callback({ requestHeaders: details.requestHeaders })
  })
}
