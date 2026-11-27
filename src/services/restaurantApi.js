const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')

export async function getPublicRestaurants(signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/food/restaurants`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `Restaurants could not be loaded (HTTP ${response.status})`)
  }
  const rows = result?.data ?? result
  return Array.isArray(rows) ? rows : []
}

export async function getPublicRestaurant(slug, signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/food/restaurants/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `Restaurant could not be loaded (HTTP ${response.status})`)
  }
  return result?.data ?? result
}
