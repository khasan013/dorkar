import { isAdminRole } from './adminRoles'

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
  window.dispatchEvent(new Event('dorkar-auth-change'))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
  window.dispatchEvent(new Event('dorkar-auth-change'))
}

export function getPostLoginPath(user) {
  const requestedPath = new URLSearchParams(window.location.search).get('returnTo')
  const isAdmin = isAdminRole(user?.role)
  const safeRequestedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') && !requestedPath.includes('\\')

  if (isAdmin) {
    return safeRequestedPath && (requestedPath === '/admin' || requestedPath.startsWith('/admin/')) ? requestedPath : '/admin'
  }

  if (String(user?.partnerType || '').toUpperCase() === 'RESTAURANT') {
    return '/restaurant/dashboard'
  }

  if (['DELIVERY', 'RIDE', 'RIDE_SHARE', 'RIDE-SHARE'].includes(String(user?.partnerType || '').toUpperCase())) {
    return safeRequestedPath && requestedPath.startsWith('/rider/') ? requestedPath : '/rider/dashboard'
  }

  if (safeRequestedPath) {
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
