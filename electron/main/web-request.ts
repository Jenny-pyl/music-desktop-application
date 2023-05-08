import { session } from 'electron'
import cookie from 'cookie'

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'

export function initWebRequest() {
  // https://www.electronjs.org/docs/latest/api/web-request
  session.defaultSession.webRequest.onBeforeSendHeaders({
    // https://github.com/listen1/listen1_chrome_extension/blob/v2.28.0/js/background.js#L42-L53
    urls: [
      // QQ
      ...[
        'c.y.qq.com',
        'i.y.qq.com',
        'qqmusic.qq.com',
        'music.qq.com',
        'imgcache.qq.com',
      ].map(url => `https://${url}/*`),
      // 酷我
      ...[
        '*://www.kuwo.cn/*',
      ],
      // 咪咕
      ...[
        'https://music.migu.cn/*',
        'https://app.c.nf.migu.cn/*',
        'https://jadeite.migu.cn/*',
      ],
    ],
  }, async (details, callback) => {
    details.requestHeaders['User-Agent'] = details.requestHeaders['User-Agent'].replace(`Electron/${[process.versions.electron]} `, '')

    const { url } = details

    // QQ
    if (url.includes('qq.com')) {
      details.requestHeaders.origin = 'https://y.qq.com'
      details.requestHeaders.referer = 'https://y.qq.com/'
    }

    // 酷我
    else if (url.includes('www.kuwo.cn')) {
      details.requestHeaders.referer = 'https://www.kuwo.cn/'

      // TODO: 使用 Web 天然支持的 set cookie
      const domain = 'www.kuwo.cn'
      const cookies = (await session.defaultSession.cookies.get({})).filter(c => c.domain === domain)
      details.requestHeaders.Cookie = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    }

    // 咪咕
    else if (url.includes('music.migu.cn')) {
      details.requestHeaders.referer = 'https://music.migu.cn/v3/music/player/audio?from=migu'
    } else if (url.includes('app.c.nf.migu.cn')) {
      details.requestHeaders.origin = ''
      details.requestHeaders.referer = ''
      details.requestHeaders['User-Agent'] = MOBILE_UA
    } else if (url.includes('jadeite.migu.cn')) {
      details.requestHeaders.origin = ''
      details.requestHeaders.referer = ''
      details.requestHeaders['User-Agent'] = 'okhttp/3.12.12'
    }

    callback({ requestHeaders: details.requestHeaders })
  })

  // 响应头拦截 - 修复 Cookie
  session.defaultSession.webRequest.onHeadersReceived({
    urls: ['*://*/*'],
  }, async (details, callback) => {
    const cookies = details.responseHeaders?.['Set-Cookie'] ?? []
    if (cookies[0]) {
      const cookieObj = cookie.parse(cookies[0])
      for (const [name, value] of Object.entries(cookieObj)) {
        if ([
          'domain',
          'path',
          'Size',
          'http',
          'expires',
          'secure',
          'Max-Age',
        ].includes(name)) continue

        let expirationDate: number | undefined
        if (cookieObj.expires) {
          expirationDate = new Date(cookieObj.expires).getTime()
        } else if (cookieObj['Max-Age']) {
          expirationDate = Date.now() + parseInt(cookieObj['Max-Age'])
        }
        await session.defaultSession.cookies.set({
          url: details.url,
          name,
          value,
          path: cookieObj.path,
          domain: cookieObj.domain,
          httpOnly: !!cookieObj.http,
          secure: !!cookieObj.secure,
          expirationDate,
        })
      }
    }

    callback(details)
  })
}
