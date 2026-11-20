const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com')
  .trim()
  .replace(/\/$/, '')

export async function uploadMyProfilePhoto(file, token) {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/photo`, {
    method: 'PATCH',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    body,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || result?.detail || `Profile photo upload failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}
