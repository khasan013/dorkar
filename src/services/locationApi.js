import { readAuthSession } from '../auth/session'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')

async function request(path, { token, method = 'GET', body, signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) throw new Error(result?.message || `Location request failed (${response.status})`)
  return result?.data
}

export function reverseGeocode(latitude, longitude, language = 'bn,en', signal) {
  const query = new URLSearchParams({ lat: String(latitude), lon: String(longitude), language })
  return request(`/api/v1/location/reverse?${query}`, { signal })
}

export function searchLocations(query, language = 'bn,en', signal) {
  const params = new URLSearchParams({ q: query, language })
  return request(`/api/v1/location/search?${params}`, { signal })
}

export function getDeliveryLocations(signal) {
  const token = readAuthSession()?.accessToken
  return token ? request('/api/v1/users/me/locations', { token, signal }) : Promise.resolve([])
}

export function saveDeliveryLocation(location) {
  const token = readAuthSession()?.accessToken
  if (!token) return Promise.reject(new Error('Sign in to save delivery addresses.'))
  return request('/api/v1/users/me/locations', { token, method: 'POST', body: location })
}
