const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com')
  .trim()
  .replace(/\/$/, '')

export async function getActiveBanners(signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/banners/active`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new Error(`Banner request failed (HTTP ${response.status})`)

  const result = await response.json()
  if (result?.success === false) throw new Error(result.message || 'Banners are unavailable')
  const banners = result?.data
  return Array.isArray(banners) ? banners : []
}
