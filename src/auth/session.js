const AUTH_SESSION_KEY = 'dorkar-auth-session'

export function readAuthSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null')
    if (!session?.accessToken) return null

    if (session.expiresAt) {
      const expiresAt = Date.parse(session.expiresAt)
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        localStorage.removeItem(AUTH_SESSION_KEY)
        return null
      }
    }

    return session
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function saveAuthSession(session) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}

export function getPostLoginPath() {
  const requestedPath = new URLSearchParams(window.location.search).get('returnTo')
  if (requestedPath?.startsWith('/') && !requestedPath.startsWith('//') && !requestedPath.includes('\\')) {
    return requestedPath
  }
  return '/dashboard'
}

export function redirectToLogin(returnTo = window.location.pathname + window.location.search + window.location.hash) {
  const query = new URLSearchParams({ returnTo })
  window.location.replace('/login?' + query.toString())
}

export function signOut() {
  clearAuthSession()
  window.location.assign('/login')
}
