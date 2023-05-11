export const locaStorage = {
  get<T = null | string>(key: string) {
    let value = localStorage.getItem(key)
    try {
      value && (value = JSON.parse(value))
    } catch { }
    return value as T
  },
  set(key: string, value: any) {
    if (value == null) return

    if (typeof value === 'object') {
      try {
        value = JSON.stringify(value)
      } catch (error) { }
    }

    localStorage.setItem(key, value)
  },
}

export function query2search(json: Record<string, any>, encode = false) {
  Object.keys(json).forEach(key => {
    if (json[key] == null) {
      delete json[key]
    }
  })
  const querystring = new URLSearchParams(json).toString()
  return encode ? encodeURIComponent(querystring) : querystring
}

export function search2query(querystring: string, decode = false) {
  if (decode) {
    querystring = decodeURIComponent(querystring)
  }
  return Object.fromEntries(new URLSearchParams(querystring))
}

export function syncThemeToCssVariable(theme: { color: string }) {
  const { color } = theme
  const oCssVarStyle = document.getElementById('theme-css-variable')!
  const alpha = {
    '09': 'E5',
    '08': 'CC',
    '07': 'B2',
    '06': '99',
    '05': '7F',
    '04': '66',
    '03': '4C',
    '02': '33',
    '01': '19',
  }
  oCssVarStyle.innerHTML = `:root {
--primary-color: ${color};
${Object.entries(alpha).map(([key, val]) => `--primary-color-${key}: ${color + val}`).join(';\n')};
}`
}
