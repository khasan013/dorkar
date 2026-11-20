const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com')
  .trim()
  .replace(/\/$/, '')

async function profileRequest(path, token, { method = 'GET', body, signal } = {}) {
  const isForm = body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || result?.detail || `Profile request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}

export function getMyProfile(token, signal) {
  return profileRequest('/api/v1/users/me', token, { signal })
}

export function updateMyProfile(profile, token) {
  return profileRequest('/api/v1/users/me', token, { method: 'PATCH', body: profile })
}

export async function uploadMyProfilePhoto(file, token) {
  const body = new FormData()
  body.append('file', file)
  return profileRequest('/api/v1/users/me/photo', token, { method: 'PATCH', body })
}

export function getSavedLocations(token, signal) {
  return profileRequest('/api/v1/users/me/locations', token, { signal })
}

export function createSavedLocation(location, token) {
  return profileRequest('/api/v1/users/me/locations', token, { method: 'POST', body: location })
}

export function updateSavedLocation(id, location, token) {
  return profileRequest(`/api/v1/users/me/locations/${encodeURIComponent(id)}`, token, { method: 'PUT', body: location })
}

export function deleteSavedLocation(id, token) {
  return profileRequest(`/api/v1/users/me/locations/${encodeURIComponent(id)}`, token, { method: 'DELETE' })
}
