const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')

async function request(path, token, options = {}) {
  if (!token) throw new Error('Sign in to view notifications.')
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) throw new Error(result?.message || `Notification request failed (${response.status}).`)
  return result?.data
}

export async function getNotifications(token, signal) {
  const data = await request('', token, { signal })
  return Array.isArray(data) ? data : []
}

export async function getUnreadNotificationCount(token, signal) {
  const data = await request('/unread-count', token, { signal })
  return Number(data?.count) || 0
}

export function markNotificationRead(token, id) {
  return request(`/${encodeURIComponent(id)}/read`, token, { method: 'PATCH' })
}

export function markAllNotificationsRead(token) {
  return request('/read-all', token, { method: 'POST' })
}
