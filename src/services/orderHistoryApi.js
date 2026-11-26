const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com')
  .trim()
  .replace(/\/$/, '')

export async function getOrderHistory(token, signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/orders/history`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || result?.detail || `Could not load order history (HTTP ${response.status})`)
  }
  return Array.isArray(result?.data) ? result.data : []
}
