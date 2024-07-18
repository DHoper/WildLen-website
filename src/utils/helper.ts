export async function setCookie(
  name: string,
  value: string,
  days: number,
  secure = false,
  sameSite = 'Lax'
) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  let cookieString = name + '=' + (value || '') + expires + '; path=/'
  if (secure) {
    cookieString += '; Secure'
  }
  if (sameSite) {
    cookieString += '; SameSite=' + sameSite
  }
  document.cookie = cookieString
}

export async function getCookie(cookieName: string) {
  const name = cookieName + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(';')

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim()
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length, cookie.length)
    }
  }
  return ''
}

export async function removeCookie(name: string) {
  const expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = name + '=' + expires + '; path=/';
}


export function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}
