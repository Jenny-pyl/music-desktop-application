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
      // 网易
      ...[
        'music.163.com',
        'interface3.music.163.com',
      ].map(url => `https://${url}/*`),
      // 酷我
      ...[
        'www.kuwo.cn',
      ].map(url => `*://${url}/*`),
      // 咪咕
      ...[
        'music.migu.cn',
        'app.c.nf.migu.cn',
        'jadeite.migu.cn',
      ].map(url => `https://${url}/*`),
    ],
  }, async (details, callback) => {
    details.requestHeaders['User-Agent'] = details.requestHeaders['User-Agent'].replace(`Electron/${[process.versions.electron]} `, '')
    const { url } = details
    // TODO: 使用 Web 天然支持的 set cookie
    const cookies = await session.defaultSession.cookies.get({})

    // QQ
    if (url.includes('qq.com')) {
      details.requestHeaders.origin = 'https://y.qq.com'
      details.requestHeaders.referer = 'https://y.qq.com/'
    }

    // 网易
    if (url.includes('://music.163.com/') || url.includes('://interface3.music.163.com/')) {
      details.requestHeaders.referer = 'https://music.163.com/'
      details.requestHeaders.Cookie = cookies
        .filter(c => ['music.163.com', 'interface3.music.163.com'].includes(c.domain!))
        .map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    }

    // 酷我
    else if (url.includes('www.kuwo.cn')) {
      details.requestHeaders.referer = 'https://www.kuwo.cn/'
      details.requestHeaders.Cookie = cookies
        .filter(c => c.domain === 'www.kuwo.cn')
        .map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
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
    const cookies = (details.responseHeaders?.['set-cookie'] || details.responseHeaders?.['Set-Cookie']) ?? []
    if (cookies[0]) {
      const cookieObj = cookie.parse(cookies[0])
      for (const [nameRaw, value] of Object.entries(cookieObj)) {
        // 兼容大小写
        const name = nameRaw.toLowerCase()
        cookieObj[name] = value

        if ([
          'domain',
          'path',
          'Size',
          'http',
          'expires',
          'secure',
          'max-age',
        ].includes(name)) continue

        let expirationDate: number | undefined
        if (cookieObj.expires) {
          expirationDate = new Date(cookieObj.expires).getTime()
        } else if (cookieObj['max-age']) {
          expirationDate = Date.now() + parseInt(cookieObj['max-age'])
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
